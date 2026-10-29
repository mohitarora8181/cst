import { z } from 'zod';
import { ROLES } from '../config/constants.js';
import { optStr, optUrl } from './common.js';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72)
  .regex(/[A-Za-z]/, 'Password needs a letter')
  .regex(/\d/, 'Password needs a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password,
  role: z.enum(Object.values(ROLES)).default(ROLES.ARTIST),
  agencyName: optStr(120),
  inviteCode: optStr(120),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatar: optUrl,
  agencyName: optStr(120),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});
