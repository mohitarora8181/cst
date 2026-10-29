'use client';

import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, timeLeft } from '@/lib/utils';

export function Deadline({ date, className }: { date: string; className?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const { label, urgent, closed } = timeLeft(date);
  return (
    <span suppressHydrationWarning className={cn('inline-flex items-center gap-1 text-xs font-bold', closed ? 'text-muted' : urgent ? 'text-pink' : 'text-fg/80', className)}>
      <Timer className={cn('h-3.5 w-3.5', urgent && !closed && 'animate-pulse')} />
      {label}
    </span>
  );
}
