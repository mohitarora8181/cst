import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2', className)} aria-label="CastLab home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-lime shadow-brutal-sm transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="currentColor" aria-hidden>
          <path d="M3 8.5h18l-2 3H5z" />
          <path d="M3 12.5h18V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M4 4.8 20.4 2l.5 2.9L4.5 7.7z" opacity=".85" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-ink bg-pink" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        Cast<span className="text-pink">Lab</span>
      </span>
    </Link>
  );
}
