'use client';

import { Play, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { drivePreviewUrl, isDriveLink } from '@/lib/drive';
import { cn } from '@/lib/utils';

/** Click-to-load Google Drive player (keeps pages fast and avoids N iframes on load). */
export function DriveVideo({ url, title, className }: { url: string; title?: string; className?: string }) {
  const [play, setPlay] = useState(false);
  const embed = drivePreviewUrl(url);

  if (!embed) {
    return (
      <div className={cn('grid aspect-video place-items-center rounded-2xl border-2 border-dashed border-danger/40 text-sm text-danger', className)}>
        <span className="flex items-center gap-2"><TriangleAlert className="h-4 w-4" /> Invalid Drive link</span>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-video overflow-hidden rounded-2xl border-2 border-ink bg-ink dark:border-line', className)}>
      {play ? (
        <iframe src={embed} title={title || 'Video'} allow="autoplay; encrypted-media" allowFullScreen className="absolute inset-0 h-full w-full" />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--violet)/.55),transparent_55%),radial-gradient(circle_at_80%_80%,rgb(var(--pink)/.5),transparent_50%)]">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-lime text-ink shadow-brutal transition group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </span>
          {title && <span className="max-w-[80%] truncate text-sm font-semibold text-white">{title}</span>}
          <span className="text-[10px] uppercase tracking-widest text-white/60">Google Drive</span>
        </button>
      )}
    </div>
  );
}

export function DriveHelp() {
  return (
    <span className="block text-xs leading-relaxed text-muted">
      Upload your video to Google Drive → <b>Share</b> → General access: <b>“Anyone with the link”</b> (Viewer) → <b>Copy link</b>.
    </span>
  );
}

export { isDriveLink };
