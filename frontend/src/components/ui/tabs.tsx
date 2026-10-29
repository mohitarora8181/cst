'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string> { value: T; label: React.ReactNode; count?: number; icon?: React.ReactNode }

/** Pill tabs with an animated sliding indicator. */
export function Tabs<T extends string>({
  items, value, onChange, className, size = 'md',
}: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md' }) {
  const id = useId();
  return (
    <div role="tablist" className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border-2 border-ink bg-surface p-1 scrollbar-none dark:border-line', className)}>
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative inline-flex items-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              active ? 'text-ink' : 'text-muted hover:text-fg'
            )}
          >
            {active && (
              <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-xl bg-lime" transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }} />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className={cn('rounded-full px-1.5 py-px text-[10px] font-bold', active ? 'bg-ink text-lime' : 'bg-surface-2 text-muted')}>{t.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
