'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-semibold">{label}</span>}
          {description && <span className="block text-xs text-muted">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full border-2 border-ink transition-colors dark:border-line', checked ? 'bg-lime' : 'bg-surface-2')}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 30 }} className={cn('absolute top-0.5 h-5 w-5 rounded-full border-2 border-ink bg-white', checked ? 'right-0.5' : 'left-0.5')} />
      </button>
    </label>
  );
}
