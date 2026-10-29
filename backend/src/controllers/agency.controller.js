import { Application, ArtistProfile, CastingCall } from '../models/index.js';

const WEEKS = 8;

export async function getStats(_req, res) {
  const since = new Date(Date.now() - WEEKS * 7 * 24 * 60 * 60 * 1000);

  const [artists, verified, openCalls, totalCalls, funnel, signups, topCalls, recent, genderSplit] = await Promise.all([
    ArtistProfile.countDocuments(),
    ArtistProfile.countDocuments({ isVerified: true }),
    CastingCall.countDocuments(CastingCall.acceptingFilter()),
    CastingCall.countDocuments(),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ArtistProfile.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateTrunc: { date: '$createdAt', unit: 'week' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    CastingCall.find(CastingCall.acceptingFilter())
      .sort({ applicationsCount: -1 })
      .limit(5)
      .select('title roleName projectName applicationsCount deadline views'),
    Application.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('profile', 'stageName headshot slug')
      .populate('castingCall', 'roleName projectName'),
    ArtistProfile.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),
  ]);

  const funnelMap = Object.fromEntries(funnel.map((f) => [f._id, f.count]));
  res.json({
    success: true,
    totals: {
      artists,
      verified,
      openCalls,
      totalCalls,
      applications: funnel.reduce((n, f) => n + f.count, 0),
      selected: funnelMap.selected || 0,
    },
    funnel: funnelMap,
    signups: signups.map((s) => ({ week: s._id, count: s.count })),
    genderSplit: genderSplit.map((g) => ({ gender: g._id || 'Unspecified', count: g.count })),
    topCalls,
    recent,
  });
}
