import crypto from 'node:crypto';

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function uniqueSlug(text) {
  const base = slugify(text) || 'artist';
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}
