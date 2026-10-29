import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';

/**
 * Uploads an in-memory image buffer to imgbb and returns the hosted URLs.
 * The API key never leaves the server.
 */
export async function uploadToImgbb(file, name) {
  if (!env.imgbbApiKey) {
    throw new ApiError(503, 'Image hosting is not configured. Set IMGBB_API_KEY on the server, or paste an image URL instead.');
  }

  const form = new FormData();
  form.append('image', file.buffer.toString('base64'));
  if (name) form.append('name', name.slice(0, 60));

  const res = await fetch(`${IMGBB_ENDPOINT}?key=${encodeURIComponent(env.imgbbApiKey)}`, { method: 'POST', body: form });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new ApiError(502, json?.error?.message || 'Image upload failed, please try again');
  }

  const { data } = json;
  return {
    id: data.id,
    url: data.url,
    displayUrl: data.display_url,
    thumbUrl: data.thumb?.url || data.display_url,
    mediumUrl: data.medium?.url || data.display_url,
    width: Number(data.width),
    height: Number(data.height),
  };
}
