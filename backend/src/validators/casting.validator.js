import { z } from 'zod';
import { CASTING_STATUS, CATEGORIES, GENDERS, PROJECT_TYPES, ROLE_TYPES } from '../config/constants.js';
import { boolish, csv, enumField, optDate, optNum, optStr, optUrl, pageQuery, stringList, withDefaults } from './common.js';

const castingBase = z.object({
  title: z.string().trim().min(4).max(120),
  projectName: z.string().trim().min(2).max(120),
  projectType: enumField(PROJECT_TYPES),
  productionHouse: optStr(120),
  description: z.string().trim().min(20, 'Description should be at least 20 characters').max(5000),
  roleName: z.string().trim().min(2).max(80),
  roleType: enumField(ROLE_TYPES),
  characterBrief: optStr(2000),
  gender: enumField([...GENDERS, 'Any']),
  ageMin: optNum(0, 100),
  ageMax: optNum(0, 100),
  heightMinCm: optNum(50, 250),
  heightMaxCm: optNum(50, 250),
  languages: stringList(10),
  skills: stringList(15),
  categories: z.array(z.enum(CATEGORIES)).max(5).optional(),
  location: optStr(120),
  shootStart: optDate,
  shootEnd: optDate,
  compensation: optStr(120),
  isPaid: z.boolean(),
  deadline: z.coerce.date(),
  selfTapeRequired: z.boolean(),
  selfTapeInstructions: optStr(3000),
  coverImage: optUrl,
  tags: stringList(10, 30),
  isUrgent: z.boolean(),
  status: enumField(CASTING_STATUS),
});

const ageCheck = (d) => d.ageMin == null || d.ageMax == null || d.ageMin <= d.ageMax;

const CASTING_DEFAULTS = { roleType: 'Supporting', gender: 'Any', isPaid: true, selfTapeRequired: false, isUrgent: false, status: 'open' };

export const createCastingSchema = withDefaults(
  castingBase.refine(ageCheck, { message: 'Minimum age cannot exceed maximum age', path: ['ageMin'] }),
  CASTING_DEFAULTS
);
export const updateCastingSchema = castingBase.partial().refine(ageCheck, { message: 'Minimum age cannot exceed maximum age', path: ['ageMin'] });

export const castingStatusSchema = z.object({ status: z.enum(CASTING_STATUS) });

export const castingQuerySchema = z.object({
  ...pageQuery,
  q: optStr(80),
  projectType: csv,
  gender: csv,
  location: optStr(60),
  paid: boolish,
  urgent: boolish,
  // agency-only: draft/closed listings
  scope: z.enum(['open', 'all', 'draft', 'closed']).default('open'),
  sort: z.enum(['recent', 'deadline', 'popular']).default('recent'),
});
