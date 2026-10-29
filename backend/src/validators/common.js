import { z } from 'zod';
import { isDriveLink } from '../utils/drive.js';

const emptyToNull = (v) => (v === '' || v === undefined ? null : v);

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const idParam = z.object({ id: objectId });

export const str = (max = 200) => z.string().trim().max(max);
export const optStr = (max = 200) => z.string().trim().max(max).optional();
export const url = z.string().trim().url('Must be a valid URL').max(1000);
export const optUrl = z.preprocess(emptyToNull, url.nullable()).optional();

export const optEnum = (values) => z.preprocess(emptyToNull, z.enum(values).nullable()).optional();
export const optDate = z.preprocess(emptyToNull, z.coerce.date().nullable()).optional();
export const optNum = (min, max) => z.preprocess(emptyToNull, z.coerce.number().min(min).max(max).nullable()).optional();

export const stringList = (max = 30, itemMax = 60) => z.array(z.string().trim().min(1).max(itemMax)).max(max).optional();

export const driveLink = z
  .string()
  .trim()
  .refine(isDriveLink, 'Please share a Google Drive file link (Anyone with the link → Viewer)');

/** Accepts "a,b,c" or ["a","b"] from query strings. */
export const csv = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (Array.isArray(v) ? v : v.split(',')).map((s) => s.trim()).filter(Boolean))
  .optional();

export const boolish = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1')
  .optional();

export const pageQuery = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
};

const blankToUndefined = (v) => (v === '' || v === null ? undefined : v);

/** Enum that treats a blank select ("") as "not provided". */
export const enumField = (values) => z.preprocess(blankToUndefined, z.enum(values));

/**
 * Applies create-time defaults for keys the client omitted. Keeping defaults out of the base
 * object matters: zod still fills `.default()` values under `.partial()`, which would silently
 * overwrite stored fields on every PATCH.
 */
export const withDefaults = (schema, defaults) =>
  z.preprocess((body) => {
    const out = { ...(body ?? {}) };
    for (const [k, v] of Object.entries(defaults)) if (blankToUndefined(out[k]) === undefined) out[k] = v;
    return out;
  }, schema);
