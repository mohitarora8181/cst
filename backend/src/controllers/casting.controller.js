import { ROLES } from '../config/constants.js';
import { Application, ArtistProfile, CastingCall } from '../models/index.js';
import { candidateFilter, scoreMatch } from '../services/matching.service.js';
import { notifyMany } from '../services/notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginated } from '../utils/pagination.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isAgency = (user) => user?.role === ROLES.AGENCY;

const SORTS = {
  recent: { isUrgent: -1, createdAt: -1 },
  deadline: { deadline: 1 },
  popular: { applicationsCount: -1 },
};

function buildCastingFilter(q, user) {
  let filter;
  if (q.scope !== 'open' && !isAgency(user)) throw ApiError.forbidden();
  switch (q.scope) {
    case 'all': filter = {}; break;
    case 'draft': filter = { status: 'draft' }; break;
    case 'closed': filter = CastingCall.closedFilter(); break;
    default: filter = CastingCall.acceptingFilter();
  }

  const and = [];
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    and.push({ $or: [{ title: rx }, { projectName: rx }, { roleName: rx }, { productionHouse: rx }, { tags: rx }] });
  }
  if (q.projectType?.length) and.push({ projectType: { $in: q.projectType } });
  if (q.gender?.length) and.push({ gender: { $in: [...q.gender, 'Any'] } });
  if (q.location) and.push({ location: new RegExp(escapeRegex(q.location), 'i') });
  if (q.paid !== undefined) and.push({ isPaid: q.paid });
  if (q.urgent) and.push({ isUrgent: true });

  return and.length ? { $and: [filter, ...and] } : filter;
}

/** For signed-in artists, decorates calls with their match score and whether they've applied. */
async function decorateForArtist(calls, user) {
  if (user?.role !== ROLES.ARTIST || !calls.length) return calls.map((c) => c.toJSON());
  const [profile, applied] = await Promise.all([
    ArtistProfile.findOne({ user: user._id }).lean(),
    Application.find({ artist: user._id, castingCall: { $in: calls.map((c) => c._id) } }).select('castingCall status').lean(),
  ]);
  const appliedMap = new Map(applied.map((a) => [a.castingCall.toString(), a.status]));
  return calls.map((c) => ({
    ...c.toJSON(),
    match: scoreMatch(profile, c),
    applicationStatus: appliedMap.get(c._id.toString()) || null,
  }));
}

export async function listCastings(req, res) {
  const pg = getPagination(req.query, { defaultLimit: 12 });
  const filter = buildCastingFilter(req.query, req.user);
  const [calls, total] = await Promise.all([
    CastingCall.find(filter).sort(SORTS[req.query.sort]).skip(pg.skip).limit(pg.limit).select('-selfTapeInstructions'),
    CastingCall.countDocuments(filter),
  ]);
  res.json({ success: true, ...paginated(await decorateForArtist(calls, req.user), total, pg) });
}

export async function getCasting(req, res) {
  const call = await CastingCall.findById(req.params.id).populate('createdBy', 'name agencyName avatar');
  if (!call || (call.status === 'draft' && !isAgency(req.user))) throw ApiError.notFound('Casting call not found');

  if (!isAgency(req.user)) CastingCall.updateOne({ _id: call._id }, { $inc: { views: 1 } }).catch(() => {});

  const [data] = await decorateForArtist([call], req.user);
  if (req.user?.role === ROLES.ARTIST) {
    data.myApplication = await Application.findOne({ castingCall: call._id, artist: req.user._id }).select('-agencyNotes -rating');
  }
  res.json({ success: true, casting: data });
}

/** Smart alerts: tell strongly-matching, available artists about a newly opened call. */
async function alertMatchingArtists(call) {
  const candidates = await ArtistProfile.find({ ...candidateFilter(call), availability: 'available' }).limit(1000).lean();
  const matched = candidates.filter((p) => scoreMatch(p, call).score >= 75).map((p) => p.user);
  await notifyMany(matched, {
    type: 'casting',
    title: `New role that fits you: ${call.roleName}`,
    body: `${call.projectName} (${call.projectType}) is casting. Apply before ${call.deadline.toDateString()}.`,
    link: `/castings/${call._id}`,
  });
}

export async function createCasting(req, res) {
  const call = await CastingCall.create({ ...req.body, createdBy: req.user._id });
  if (call.status === 'open') alertMatchingArtists(call).catch(() => {});
  res.status(201).json({ success: true, casting: call });
}

export async function updateCasting(req, res) {
  const call = await CastingCall.findById(req.params.id);
  if (!call) throw ApiError.notFound('Casting call not found');
  const wasOpen = call.status === 'open';
  call.set(req.body);
  await call.save();
  if (!wasOpen && call.status === 'open') alertMatchingArtists(call).catch(() => {});
  res.json({ success: true, casting: call });
}

export async function setCastingStatus(req, res) {
  req.body = { status: req.body.status };
  return updateCasting(req, res);
}

export async function deleteCasting(req, res) {
  const call = await CastingCall.findByIdAndDelete(req.params.id);
  if (!call) throw ApiError.notFound('Casting call not found');
  await Application.deleteMany({ castingCall: call._id });
  res.json({ success: true });
}

/** Talent the agency should look at for this call — scored, excluding those who already applied. */
export async function getSuggestions(req, res) {
  const call = await CastingCall.findById(req.params.id);
  if (!call) throw ApiError.notFound('Casting call not found');

  const appliedProfiles = await Application.distinct('profile', { castingCall: call._id });
  const candidates = await ArtistProfile.find({ ...candidateFilter(call), _id: { $nin: appliedProfiles } })
    .select('slug stageName headline headshot gender dob city heightCm languages skills categories willingToTravel availability isVerified completeness')
    .limit(500);

  const ranked = candidates
    .map((p) => ({ profile: p.toJSON(), match: scoreMatch(p, call) }))
    .filter((r) => r.match.score >= 50)
    .sort((a, b) => b.match.score - a.match.score || b.profile.completeness - a.profile.completeness)
    .slice(0, 24);

  res.json({ success: true, items: ranked });
}
