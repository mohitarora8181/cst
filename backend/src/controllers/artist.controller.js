import { Application, ArtistProfile, CastingCall, COMPLETENESS_CHECKS } from '../models/index.js';
import { scoreMatch } from '../services/matching.service.js';
import { getPagination, paginated } from '../utils/pagination.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const OPEN_FEED_CAP = 300;

const CALL_FIELDS = 'title projectName projectType productionHouse roleName roleType gender ageMin ageMax heightMinCm heightMaxCm languages skills categories location deadline isPaid compensation coverImage isUrgent status selfTapeRequired applicationsCount createdAt';

/**
 * Artist dashboard feed, split into three tabs:
 *  - open:    calls still accepting that the artist hasn't applied to (ranked by Smart Match)
 *  - applied: the artist's applications on calls that are still accepting
 *  - closed:  the artist's applications on calls that closed or passed their deadline
 */
export async function getFeed(req, res) {
  const { tab, q } = req.query;
  const pg = getPagination(req.query, { defaultLimit: 12 });
  const userId = req.user._id;

  const [profile, myApps] = await Promise.all([
    ArtistProfile.findOne({ user: userId }).lean(),
    Application.find({ artist: userId })
      .select('-agencyNotes -rating')
      .populate('castingCall', CALL_FIELDS)
      .sort({ updatedAt: -1 }),
  ]);

  const live = myApps.filter((a) => a.castingCall);
  const appliedIds = live.map((a) => a.castingCall._id);
  const applied = live.filter((a) => a.castingCall.isAccepting);
  const closed = live.filter((a) => !a.castingCall.isAccepting);

  const openFilter = { ...CastingCall.acceptingFilter(), _id: { $nin: appliedIds } };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    openFilter.$or = [{ title: rx }, { projectName: rx }, { roleName: rx }];
  }

  let result;
  if (tab === 'open') {
    const calls = await CastingCall.find(openFilter).select(CALL_FIELDS).sort({ createdAt: -1 }).limit(OPEN_FEED_CAP);
    const ranked = calls
      .map((c) => ({ ...c.toJSON(), match: scoreMatch(profile, c) }))
      .sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent) || b.match.score - a.match.score);
    result = paginated(ranked.slice(pg.skip, pg.skip + pg.limit), ranked.length, pg);
  } else {
    const list = tab === 'applied' ? applied : closed;
    const filtered = q ? list.filter((a) => new RegExp(escapeRegex(q), 'i').test(`${a.castingCall.title} ${a.castingCall.projectName} ${a.castingCall.roleName}`)) : list;
    result = paginated(filtered.slice(pg.skip, pg.skip + pg.limit), filtered.length, pg);
  }

  const openCount = await CastingCall.countDocuments({ ...CastingCall.acceptingFilter(), _id: { $nin: appliedIds } });
  res.json({ success: true, tab, counts: { open: openCount, applied: applied.length, closed: closed.length }, ...result });
}

export async function getOverview(req, res) {
  const userId = req.user._id;
  const profile = await ArtistProfile.findOne({ user: userId });
  const [statusCounts, upcomingAuditions] = await Promise.all([
    Application.aggregate([{ $match: { artist: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.find({ artist: userId, status: 'audition', 'audition.scheduledAt': { $gte: new Date() } })
      .sort({ 'audition.scheduledAt': 1 })
      .limit(5)
      .select('audition castingCall status')
      .populate('castingCall', 'roleName projectName projectType coverImage status deadline'),
  ]);

  const stats = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
  stats.total = statusCounts.reduce((n, s) => n + s.count, 0);

  res.json({
    success: true,
    stats,
    upcomingAuditions,
    profile: profile && {
      slug: profile.slug,
      completeness: profile.completeness,
      profileViews: profile.profileViews,
      availability: profile.availability,
      isVerified: profile.isVerified,
      checklist: COMPLETENESS_CHECKS.map(({ key, label, weight, test }) => ({ key, label, weight, done: test(profile) })),
    },
  });
}
