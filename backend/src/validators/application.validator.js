import { z } from 'zod';
import { APPLICATION_STATUS, AUDITION_MODES } from '../config/constants.js';
import { csv, driveLink, optStr, pageQuery } from './common.js';

export const applySchema = z.object({
  coverNote: optStr(1000),
  selfTapeUrl: z.preprocess((v) => (v === '' ? undefined : v), driveLink.optional()),
});

export const updateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUS).optional(),
  agencyNotes: optStr(2000),
  rating: z.number().int().min(0).max(5).optional(),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(200),
  status: z.enum(APPLICATION_STATUS),
});

export const scheduleAuditionSchema = z.object({
  scheduledAt: z.coerce.date().refine((d) => d > new Date(), 'Audition must be scheduled in the future'),
  mode: z.preprocess((v) => (v === '' ? undefined : v), z.enum(AUDITION_MODES).default('online')),
  location: z.string().trim().min(3, 'Add an address or meeting link').max(300),
  notes: optStr(1000),
});

export const auditionResponseSchema = z.object({
  response: z.enum(['confirmed', 'reschedule']),
  responseNote: optStr(500),
});

export const applicationsQuerySchema = z.object({
  ...pageQuery,
  limit: z.coerce.number().int().min(1).max(500).optional(), // the pipeline board loads a whole casting at once
  status: csv,
  sort: z.enum(['recent', 'match', 'rating']).default('match'),
});

export const artistFeedQuerySchema = z.object({
  ...pageQuery,
  tab: z.enum(['open', 'applied', 'closed']).default('open'),
  q: optStr(80),
});
