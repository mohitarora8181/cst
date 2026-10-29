import { TERMINAL_STATUSES } from '../config/constants.js';
import { Application, ArtistProfile, CastingCall } from '../models/index.js';
import { scoreMatch } from '../services/matching.service.js';
import { notify } from '../services/notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginated } from '../utils/pagination.js';

const MIN_COMPLETENESS_TO_APPLY = 40;

const STATUS_MESSAGES = {
  shortlisted: { title: 'You’ve been shortlisted! 🎬', body: 'The casting team liked your profile for' },
  audition: { title: 'Audition invite', body: 'You’ve been invited to audition for' },
  selected: { title: 'Congratulations — you’re selected! 🎉', body: 'You’ve been selected for' },
  rejected: { title: 'Application update', body: 'The team has moved ahead with other artists for' },
};

function notifyStatus(app, call) {
  const msg = STATUS_MESSAGES[app.status];
  if (!msg) return;
  notify(app.artist, {
    type: app.status === 'audition' ? 'audition' : 'status',
    title: msg.title,
    body: `${msg.body} “${call.roleName}” in ${call.projectName}.`,
    link: '/dashboard',
  });
}

// ── Artist actions ─────────────────────────────────────────────

export async function apply(req, res) {
  const call = await CastingCall.findById(req.params.id);
  if (!call || !call.isAccepting) throw ApiError.badRequest('This casting call is no longer accepting applications');

  const profile = await ArtistProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.badRequest('Create your artist profile first');
  if (profile.completeness < MIN_COMPLETENESS_TO_APPLY) {
    throw ApiError.badRequest(`Your profile is ${profile.completeness}% complete. Reach ${MIN_COMPLETENESS_TO_APPLY}% to apply.`);
  }
  if (await Application.exists({ castingCall: call._id, artist: req.user._id })) {
    throw ApiError.conflict('You have already applied to this role');
  }
  if (call.selfTapeRequired && !req.body.selfTapeUrl) {
    throw ApiError.badRequest('This role needs a self-tape. Share a Google Drive link to your tape.');
  }

  const { score } = scoreMatch(profile, call);
  const app = await Application.create({
    castingCall: call._id,
    artist: req.user._id,
    profile: profile._id,
    coverNote: req.body.coverNote,
    selfTapeUrl: req.body.selfTapeUrl,
    matchScore: score,
    history: [{ status: 'applied', by: req.user._id }],
  });
  await CastingCall.updateOne({ _id: call._id }, { $inc: { applicationsCount: 1 } });

  notify(call.createdBy, {
    type: 'application',
    title: `New application: ${profile.stageName || req.user.name}`,
    body: `Applied for “${call.roleName}” · ${score}% match`,
    link: `/agency/castings/${call._id}`,
  });

  res.status(201).json({ success: true, application: app });
}

export async function withdraw(req, res) {
  const app = await Application.findOne({ _id: req.params.id, artist: req.user._id });
  if (!app) throw ApiError.notFound('Application not found');
  if (app.status !== 'applied') throw ApiError.badRequest('You can only withdraw before the casting team reviews you');
  await app.deleteOne();
  await CastingCall.updateOne({ _id: app.castingCall }, { $inc: { applicationsCount: -1 } });
  res.json({ success: true });
}

export async function respondToAudition(req, res) {
  const app = await Application.findOne({ _id: req.params.id, artist: req.user._id }).populate('castingCall', 'roleName projectName createdBy');
  if (!app?.audition?.scheduledAt) throw ApiError.notFound('No audition scheduled for this application');

  app.audition.response = req.body.response;
  app.audition.responseNote = req.body.responseNote;
  await app.save();

  notify(app.castingCall.createdBy, {
    type: 'audition',
    title: req.body.response === 'confirmed' ? 'Audition confirmed' : 'Reschedule requested',
    body: `${req.user.name} · ${app.castingCall.roleName}${req.body.responseNote ? ` — “${req.body.responseNote}”` : ''}`,
    link: `/agency/castings/${app.castingCall._id}`,
  });
  res.json({ success: true, application: app });
}

// ── Agency actions ─────────────────────────────────────────────

export async function listForCasting(req, res) {
  const call = await CastingCall.findById(req.params.id).select('title roleName projectName');
  if (!call) throw ApiError.notFound('Casting call not found');

  const pg = getPagination(req.query, { defaultLimit: 50, maxLimit: 500 });
  const filter = { castingCall: call._id };
  if (req.query.status?.length) filter.status = { $in: req.query.status };
  const sort = { match: { matchScore: -1 }, rating: { rating: -1, matchScore: -1 }, recent: { createdAt: -1 } }[req.query.sort];

  const [items, total, counts] = await Promise.all([
    Application.find(filter)
      .sort(sort)
      .skip(pg.skip)
      .limit(pg.limit)
      .populate('profile', 'slug stageName headline headshot gender dob city heightCm languages skills isVerified completeness phone whatsapp videos')
      .populate('artist', 'name email'),
    Application.countDocuments(filter),
    Application.aggregate([{ $match: { castingCall: call._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    casting: call,
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
    ...paginated(items, total, pg),
  });
}

export async function updateApplication(req, res) {
  const app = await Application.findById(req.params.id).populate('castingCall', 'roleName projectName');
  if (!app) throw ApiError.notFound('Application not found');

  const { status, agencyNotes, rating } = req.body;
  const statusChanged = status && status !== app.status;
  if (statusChanged) {
    app.status = status;
    app.history.push({ status, by: req.user._id });
  }
  if (agencyNotes !== undefined) app.agencyNotes = agencyNotes;
  if (rating !== undefined) app.rating = rating;
  await app.save();

  if (statusChanged) notifyStatus(app, app.castingCall);
  res.json({ success: true, application: app });
}

export async function bulkUpdateStatus(req, res) {
  const { ids, status } = req.body;
  const apps = await Application.find({ _id: { $in: ids }, status: { $ne: status } }).populate('castingCall', 'roleName projectName');
  await Promise.all(
    apps.map((app) => {
      app.status = status;
      app.history.push({ status, by: req.user._id });
      return app.save().then(() => notifyStatus(app, app.castingCall));
    })
  );
  res.json({ success: true, updated: apps.length });
}

export async function scheduleAudition(req, res) {
  const app = await Application.findById(req.params.id).populate('castingCall', 'roleName projectName');
  if (!app) throw ApiError.notFound('Application not found');
  if (TERMINAL_STATUSES.includes(app.status)) throw ApiError.badRequest(`This application is already ${app.status}`);

  app.audition = { ...req.body, response: 'pending' };
  if (app.status !== 'audition') {
    app.status = 'audition';
    app.history.push({ status: 'audition', by: req.user._id });
  }
  await app.save();

  const when = new Date(req.body.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  notify(app.artist, {
    type: 'audition',
    title: `Audition scheduled · ${when}`,
    body: `${app.castingCall.roleName} — ${app.castingCall.projectName} (${req.body.mode}). Please confirm from your dashboard.`,
    link: '/dashboard?tab=applied',
  });
  res.json({ success: true, application: app });
}

const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  // Neutralise spreadsheet formula injection, but leave plain phone numbers like "+91 98…" intact
  if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s-]+$/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function exportApplications(req, res) {
  const call = await CastingCall.findById(req.params.id).select('title roleName');
  if (!call) throw ApiError.notFound('Casting call not found');

  const apps = await Application.find({ castingCall: call._id })
    .sort({ matchScore: -1 })
    .populate('profile', 'stageName gender dob city heightCm languages skills phone slug')
    .populate('artist', 'name email');

  const header = ['Name', 'Email', 'Phone', 'Gender', 'Age', 'City', 'Height (cm)', 'Languages', 'Skills', 'Status', 'Match %', 'Rating', 'Self-tape', 'Profile', 'Applied on'];
  const rows = apps.map((a) => [
    a.profile?.stageName || a.artist?.name, a.artist?.email, a.profile?.phone, a.profile?.gender, a.profile?.age, a.profile?.city,
    a.profile?.heightCm, a.profile?.languages?.join('; '), a.profile?.skills?.join('; '), a.status, a.matchScore, a.rating,
    a.selfTapeUrl, a.profile?.slug ? `/artists/${a.profile.slug}` : '', a.createdAt.toISOString().slice(0, 10),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');

  const filename = `${call.roleName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-applicants.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(`﻿${csv}`);
}

