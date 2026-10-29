const PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/,
  /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]{10,})/,
];

export function extractDriveId(url = '') {
  for (const re of PATTERNS) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export const isDriveLink = (url: string) => Boolean(extractDriveId(url));

export const drivePreviewUrl = (url: string) => {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
};

export const driveThumbUrl = (url: string) => {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w640` : null;
};
