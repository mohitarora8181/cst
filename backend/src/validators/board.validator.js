import { z } from 'zod';
import { objectId, optStr } from './common.js';

export const boardSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: optStr(500),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  castingCall: z.preprocess((v) => (v === '' ? null : v), objectId.nullable()).optional(),
});
export const boardUpdateSchema = boardSchema.partial();

export const boardItemSchema = z.object({ profileId: objectId, note: optStr(300) });
export const boardItemParams = z.object({ id: objectId, profileId: objectId });
