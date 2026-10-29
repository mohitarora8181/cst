import { z } from 'zod';
import { RELEASE_TYPES } from '../config/constants.js';
import { enumField, optDate, optNum, optStr, optUrl, url, withDefaults } from './common.js';

const cta = z.object({ label: z.string().trim().max(40), href: z.string().trim().max(300) });

export const heroSchema = z.object({
  hero: z
    .object({
      eyebrow: optStr(80),
      title: z.string().trim().min(2).max(60),
      highlight: optStr(60),
      subtitle: optStr(300),
      primaryCta: cta.optional(),
      secondaryCta: cta.optional(),
      images: z.array(url).max(6).optional(),
      stats: z.array(z.object({ label: z.string().trim().max(30), value: z.string().trim().max(12) })).max(4).optional(),
    })
    .optional(),
  marquee: z.array(z.string().trim().min(1).max(40)).max(16).optional(),
});

const bannerBase = z.object({
  title: z.string().trim().min(2).max(100),
  subtitle: optStr(240),
  image: url,
  ctaLabel: optStr(40),
  ctaLink: optStr(300),
  accent: z.string().regex(/^#[0-9a-f]{6}$/i),
  isActive: z.boolean(),
  order: z.coerce.number().int().optional(),
});
export const bannerSchema = withDefaults(bannerBase, { accent: '#c6ff3d', isActive: true });
export const bannerUpdateSchema = bannerBase.partial();

const releaseBase = z.object({
  title: z.string().trim().min(1).max(100),
  type: enumField(RELEASE_TYPES),
  poster: url,
  platform: optStr(60),
  releaseDate: optDate,
  description: optStr(500),
  castedCount: optNum(0, 10000),
  link: optUrl,
  isActive: z.boolean(),
  order: z.coerce.number().int().optional(),
});
export const releaseSchema = withDefaults(releaseBase, { type: 'Feature Film', isActive: true });
export const releaseUpdateSchema = releaseBase.partial();

export const reorderSchema = z.object({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(100) });
