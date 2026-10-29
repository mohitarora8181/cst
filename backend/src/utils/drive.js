/**
 * Google Drive share-link helpers.
 * Accepts the common link shapes:
 *   https://drive.google.com/file/d/<id>/view?usp=sharing
 *   https://drive.google.com/open?id=<id>
 *   https://drive.google.com/uc?id=<id>&export=download
 */
const PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/,
  /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]{10,})/,
];

export function extractDriveId(url = '') {
  for (const re of PATTERNS) {
    const m = String(url).match(re);
    if (m) return m[1];
  }
  return null;
}

export const isDriveLink = (url) => Boolean(extractDriveId(url));

export function drivePreviewUrl(url) {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
