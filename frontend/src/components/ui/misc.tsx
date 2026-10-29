'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';
import { cn, initials } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line/30 px-6 py-16 text-center dark:border-line">
      {icon && <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border-2 border-ink bg-sun text-ink shadow-brutal-sm [&_svg]:h-7 [&_svg]:w-7">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const AVATAR_TONES = ['bg-lime', 'bg-pink', 'bg-violet', 'bg-sun', 'bg-sky', 'bg-tangerine'];

export function Avatar({ src, name = '', size = 40, className }: { src?: string | null; name?: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const tone = AVATAR_TONES[(name.charCodeAt(0) || 0) % AVATAR_TONES.length];
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink font-bold text-ink', tone, className)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function ProgressRing({ value, size = 96, stroke = 10, label }: { value: number; size?: number; stroke?: number; label?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-surface-2" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn('fill-none', value >= 80 ? 'stroke-lime' : value >= 50 ? 'stroke-sun' : 'stroke-pink')}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * Math.min(100, value)) / 100 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{label ?? <span className="font-display text-xl font-extrabold">{value}%</span>}</div>
    </div>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-surface transition hover:bg-lime disabled:opacity-40 dark:border-line" aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-3 text-sm font-semibold text-muted">
        Page <span className="text-fg">{page}</span> of {pages}
      </span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-surface transition hover:bg-lime disabled:opacity-40 dark:border-line" aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={cn('transition-transform', onChange && 'hover:scale-125')}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star style={{ width: size, height: size }} className={cn(n <= value ? 'fill-sun text-sun' : 'text-muted/40')} />
        </button>
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />;
}
