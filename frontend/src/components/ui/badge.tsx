import { cn } from '@/lib/utils';

const TONES = {
  default: 'bg-surface-2 text-fg border-line/20',
  lime: 'bg-lime text-ink border-ink',
  pink: 'bg-pink text-white border-ink',
  violet: 'bg-violet text-white border-ink',
  sun: 'bg-sun text-ink border-ink',
  sky: 'bg-sky text-ink border-ink',
  outline: 'bg-transparent text-fg border-current',
  danger: 'bg-danger/10 text-danger border-danger/30',
} as const;

export function Badge({
  tone = 'default',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', TONES[tone], className)} {...props}>
      {children}
    </span>
  );
}
