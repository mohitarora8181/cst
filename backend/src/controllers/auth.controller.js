import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { ArtistProfile, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slug.js';
import { cookieOptions, signToken } from '../utils/token.js';

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

async function sessionPayload(user) {
  const payload = { user: user.toJSON() };
  if (user.role === ROLES.ARTIST) {
    payload.profile = await ArtistProfile.findOne({ user: user._id })
      .select('slug stageName headshot completeness availability isVerified')
      .lean();
  }
  return payload;
}

function sendSession(res, user, status = 200) {
  const token = signToken(user);
  res.cookie(env.cookieName, token, cookieOptions());
  return sessionPayload(user).then((payload) => res.status(status).json({ success: true, token, ...payload }));
}

export async function register(req, res) {
  const { name, email, password, role, agencyName, inviteCode } = req.body;

  if (role === ROLES.AGENCY) {
    if (!env.agencyInviteCode || !inviteCode || !safeEqual(inviteCode, env.agencyInviteCode)) {
      throw ApiError.forbidden('A valid agency invite code is required to create an agency account');
    }
  }

  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, role, agencyName: role === ROLES.AGENCY ? agencyName || name : '' });
  if (role === ROLES.ARTIST) {
    await ArtistProfile.create({ user: user._id, slug: uniqueSlug(name), stageName: name });
  }
  return sendSession(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Incorrect email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });
  return sendSession(res, user);
}

export function logout(_req, res) {
  res.clearCookie(env.cookieName, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true });
}

export async function me(req, res) {
  res.json({ success: true, ...(await sessionPayload(req.user)) });
}

export async function updateMe(req, res) {
  const { name, avatar, agencyName } = req.body;
  if (name !== undefined) req.user.name = name;
  if (avatar !== undefined) req.user.avatar = avatar || '';
  if (agencyName !== undefined && req.user.role === ROLES.AGENCY) req.user.agencyName = agencyName;
  await req.user.save();
  res.json({ success: true, ...(await sessionPayload(req.user)) });
}

export async function changePassword(req, res) {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw ApiError.badRequest('Current password is incorrect');
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
}
