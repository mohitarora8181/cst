import { Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Infinite ticker strip. Content is duplicated so the -50% translate loops seamlessly. */
export function Marquee({ items, className, reverse, tone = 'lime' }: { items: string[]; className?: string; reverse?: boolean; tone?: 'lime' | 'pink' | 'ink' }) {
  if (!items.length) return null;
  const tones = { lime: 'bg-lime text-ink', pink: 'bg-pink text-white', ink: 'bg-ink text-lime' };
  const row = [...items, ...items];
  return (
    <div className={cn('relative overflow-hidden border-y-2 border-ink py-4', tones[tone], className)}>
      <div className={cn('flex w-max animate-marquee gap-8', reverse && '[animation-direction:reverse]')} style={{ ['--marquee-duration' as string]: `${Math.max(20, items.length * 5)}s` }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center gap-8" aria-hidden={k === 1}>
            {row.map((t, i) => (
              <span key={`${t}${i}`} className="flex items-center gap-8 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
                {t} <Asterisk className="h-7 w-7 shrink-0" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
