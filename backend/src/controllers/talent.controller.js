import { Application, ArtistProfile, Board } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { dobRangeForAge } from '../utils/age.js';
import { getPagination, paginated } from '../utils/pagination.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ciList = (values) => values.map((v) => new RegExp(`^${escapeRegex(v)}$`, 'i'));

const SORTS = {
  recent: { createdAt: -1 },
  completeness: { completeness: -1, updatedAt: -1 },
  name: { stageName: 1 },
  views: { profileViews: -1 },
};

/** Translates the agency talent-search query into a Mongo filter. */
export function buildTalentFilter(q) {
  const filter = {};

  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    filter.$or = [{ stageName: rx }, { headline: rx }, { city: rx }, { skills: rx }];
  }
  if (q.gender?.length) filter.gender = { $in: q.gender };
  if (q.city?.length) filter.city = { $in: ciList(q.city) };
  if (q.categories?.length) filter.categories = { $in: q.categories };
  if (q.experience?.length) filter.experienceLevel = { $in: q.experience };
  if (q.bodyType?.length) filter.bodyType = { $in: q.bodyType };
  if (q.skinTone?.length) filter.skinTone = { $in: q.skinTone };
  if (q.availability?.length) filter.availability = { $in: q.availability };
  if (q.languages?.length) filter.languages = { [q.matchAll ? '$all' : '$in']: q.languages };
  if (q.skills?.length) filter.skills = { [q.matchAll ? '$all' : '$in']: q.skills };
  if (q.verified) filter.isVerified = true;
  if (q.hasVideo) filter['videos.0'] = { $exists: true };
  if (q.minCompleteness) filter.completeness = { $gte: q.minCompleteness };

  if (q.ageMin != null || q.ageMax != null) filter.dob = dobRangeForAge(q.ageMin, q.ageMax);
  if (q.heightMin != null || q.heightMax != null) {
    filter.heightCm = {};
    if (q.heightMin != null) filter.heightCm.$gte = q.heightMin;
    if (q.heightMax != null) filter.heightCm.$lte = q.heightMax;
  }
  return filter;
}

export async function searchTalent(req, res) {
  const pg = getPagination(req.query, { defaultLimit: 24 });
  const filter = buildTalentFilter(req.query);

  const [items, total] = await Promise.all([
    ArtistProfile.find(filter)
      .select('slug stageName headline headshot gender dob city heightCm languages skills categories experienceLevel availability isVerified isFeatured completeness videos profileViews createdAt')
      .sort(SORTS[req.query.sort])
      .skip(pg.skip)
      .limit(pg.limit)
      .populate('user', 'email'),
    ArtistProfile.countDocuments(filter),
  ]);

  const shaped = items.map((p) => {
    const o = p.toJSON();
    o.videoCount = o.videos?.length || 0;
    delete o.videos;
    return o;
  });

  res.json({ success: true, ...paginated(shaped, total, pg) });
}

export async function getTalent(req, res) {
  const profile = await ArtistProfile.findById(req.params.id).populate('user', 'name email avatar createdAt lastLoginAt');
  if (!profile) throw ApiError.notFound('Artist not found');

  const [applications, boards] = await Promise.all([
    Application.find({ profile: profile._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('castingCall', 'title projectName roleName status deadline'),
    Board.find({ owner: req.user._id, 'items.profile': profile._id }).select('name color'),
  ]);

  res.json({ success: true, profile, applications, boards });
}

export async function updateTalentFlags(req, res) {
  const profile = await ArtistProfile.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!profile) throw ApiError.notFound('Artist not found');
  res.json({ success: true, profile });
}
