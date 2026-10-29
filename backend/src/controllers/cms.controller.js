import { Application, ArtistProfile, Banner, CastingCall, Release, SiteSetting } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

/** Everything the public homepage needs, in one round-trip. */
export async function getHome(_req, res) {
  const [settings, banners, releases, featured, castings, liveStats] = await Promise.all([
    SiteSetting.getHome(),
    Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).limit(8),
    Release.find({ isActive: true }).sort({ order: 1, releaseDate: -1 }).limit(12),
    ArtistProfile.find({ isFeatured: true, isPublic: true })
      .select('slug stageName headline headshot city categories isVerified dob')
      .sort({ updatedAt: -1 })
      .limit(10),
    CastingCall.find(CastingCall.acceptingFilter())
      .select('title projectName projectType roleName gender ageMin ageMax location deadline isPaid isUrgent coverImage applicationsCount')
      .sort({ isUrgent: -1, createdAt: -1 })
      .limit(6),
    Promise.all([
      ArtistProfile.countDocuments(),
      CastingCall.countDocuments(CastingCall.acceptingFilter()),
      Application.countDocuments({ status: 'selected' }),
    ]),
  ]);

  res.json({
    success: true,
    hero: settings.hero,
    marquee: settings.marquee,
    banners,
    releases,
    featured,
    castings,
    live: { artists: liveStats[0], openCastings: liveStats[1], selections: liveStats[2] },
  });
}

export async function getSettings(_req, res) {
  res.json({ success: true, settings: await SiteSetting.getHome() });
}

export async function updateSettings(req, res) {
  const settings = await SiteSetting.getHome();
  if (req.body.hero) settings.set('hero', { ...settings.hero.toObject(), ...req.body.hero });
  if (req.body.marquee) settings.marquee = req.body.marquee;
  settings.updatedBy = req.user._id;
  await settings.save();
  res.json({ success: true, settings });
}

/** Generic ordered-collection CRUD used for banners and releases. */
function crudFor(Model, label) {
  return {
    async list(_req, res) {
      res.json({ success: true, items: await Model.find().sort({ order: 1, createdAt: -1 }) });
    },
    async create(req, res) {
      const order = req.body.order ?? (await Model.countDocuments());
      res.status(201).json({ success: true, item: await Model.create({ ...req.body, order }) });
    },
    async update(req, res) {
      const item = await Model.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
      if (!item) throw ApiError.notFound(`${label} not found`);
      res.json({ success: true, item });
    },
    async remove(req, res) {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw ApiError.notFound(`${label} not found`);
      res.json({ success: true });
    },
    async reorder(req, res) {
      await Model.bulkWrite(req.body.ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
      res.json({ success: true });
    },
  };
}

export const banners = crudFor(Banner, 'Banner');
export const releases = crudFor(Release, 'Release');
