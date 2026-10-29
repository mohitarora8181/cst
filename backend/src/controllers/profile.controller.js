import { ROLES } from '../config/constants.js';
import { ArtistProfile, COMPLETENESS_CHECKS } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const checklist = (profile) =>
  COMPLETENESS_CHECKS.map(({ key, label, weight, test }) => ({ key, label, weight, done: test(profile) }));

async function getOwnProfile(userId) {
  const profile = await ArtistProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound('Artist profile not found');
  return profile;
}

export async function getMyProfile(req, res) {
  const profile = await getOwnProfile(req.user._id);
  res.json({ success: true, profile, checklist: checklist(profile) });
}

export async function updateMyProfile(req, res) {
  const profile = await getOwnProfile(req.user._id);
  profile.set(req.body);
  await profile.save();
  res.json({ success: true, profile, checklist: checklist(profile) });
}

/** Public digital comp card. Contact details are only revealed to agencies and the owner. */
export async function getPublicProfile(req, res) {
  const profile = await ArtistProfile.findOne({ slug: req.params.slug }).populate('user', 'name avatar createdAt');
  if (!profile) throw ApiError.notFound('Profile not found');

  const viewer = req.user;
  const isOwner = viewer && profile.user._id.equals(viewer._id);
  const isAgency = viewer?.role === ROLES.AGENCY;

  if (!profile.isPublic && !isOwner && !isAgency) throw ApiError.notFound('Profile not found');

  if (!isOwner) {
    ArtistProfile.updateOne({ _id: profile._id }, { $inc: { profileViews: 1 } }).catch(() => {});
  }

  const data = profile.toJSON();
  if (!isOwner && !isAgency) {
    delete data.phone;
    delete data.whatsapp;
    delete data.dob; // age virtual is still exposed
  }
  res.json({ success: true, profile: data, canContact: Boolean(isOwner || isAgency) });
}
