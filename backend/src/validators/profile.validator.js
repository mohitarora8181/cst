import { z } from 'zod';
import {
  AVAILABILITY, BODY_TYPES, CATEGORIES, CREDIT_TYPES, EXPERIENCE_LEVELS, EYE_COLORS,
  GENDERS, HAIR_COLORS, SKIN_TONES, VIDEO_TYPES,
} from '../config/constants.js';
import { boolish, csv, driveLink, optDate, optEnum, optNum, optStr, optUrl, pageQuery, stringList, url } from './common.js';

export const updateProfileSchema = z.object({
  stageName: optStr(80),
  headline: optStr(120),
  bio: optStr(1500),
  gender: optEnum(GENDERS),
  dob: optDate.refine((d) => !d || d < new Date(), 'Date of birth must be in the past'),
  city: optStr(60),
  state: optStr(60),
  phone: z.string().trim().regex(/^[+\d\s-]{0,16}$/, 'Invalid phone number').optional(),
  whatsapp: z.string().trim().regex(/^[+\d\s-]{0,16}$/, 'Invalid WhatsApp number').optional(),

  heightCm: optNum(50, 250),
  weightKg: optNum(10, 250),
  bodyType: optEnum(BODY_TYPES),
  skinTone: optEnum(SKIN_TONES),
  eyeColor: optEnum(EYE_COLORS),
  hairColor: optEnum(HAIR_COLORS),

  categories: z.array(z.enum(CATEGORIES)).max(6).optional(),
  experienceLevel: optEnum(EXPERIENCE_LEVELS),
  languages: stringList(15),
  skills: stringList(25),
  credits: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        role: optStr(80),
        year: optNum(1950, 2100),
        type: z.enum(CREDIT_TYPES).default('Film'),
        director: optStr(80),
      })
    )
    .max(40)
    .optional(),

  headshot: optUrl,
  photos: z.array(z.object({ url, caption: optStr(120) })).max(12, 'Up to 12 photos').optional(),
  videos: z
    .array(z.object({ title: z.string().trim().min(1).max(80), url: driveLink, type: z.enum(VIDEO_TYPES).default('Showreel') }))
    .max(8, 'Up to 8 videos')
    .optional(),

  social: z.object({ instagram: optStr(200), youtube: optStr(200), imdb: optStr(200), website: optStr(200) }).optional(),

  availability: z.enum(AVAILABILITY).optional(),
  willingToTravel: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const talentQuerySchema = z.object({
  ...pageQuery,
  q: optStr(80),
  gender: csv,
  ageMin: z.coerce.number().int().min(0).max(100).optional(),
  ageMax: z.coerce.number().int().min(0).max(100).optional(),
  heightMin: z.coerce.number().min(50).max(250).optional(),
  heightMax: z.coerce.number().min(50).max(250).optional(),
  city: csv,
  languages: csv,
  skills: csv,
  categories: csv,
  experience: csv,
  bodyType: csv,
  skinTone: csv,
  availability: csv,
  verified: boolish,
  hasVideo: boolish,
  minCompleteness: z.coerce.number().min(0).max(100).optional(),
  matchAll: boolish, // languages/skills: require ALL rather than ANY
  sort: z.enum(['recent', 'completeness', 'name', 'views']).default('recent'),
});

export const flagsSchema = z.object({
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});
