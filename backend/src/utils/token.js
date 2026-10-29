import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProd,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
