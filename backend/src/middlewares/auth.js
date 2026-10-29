import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[env.cookieName] || null;
}

async function resolveUser(req) {
  const token = readToken(req);
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    return user && user.isActive ? user : null;
  } catch {
    return null;
  }
}

/** Requires a valid session. */
export async function protect(req, _res, next) {
  const user = await resolveUser(req);
  if (!user) return next(ApiError.unauthorized());
  req.user = user;
  next();
}

/** Attaches req.user when a valid session exists, never rejects. */
export async function optionalAuth(req, _res, next) {
  req.user = await resolveUser(req);
  next();
}

/** Restricts a route to one or more roles. Use after `protect`. */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};
