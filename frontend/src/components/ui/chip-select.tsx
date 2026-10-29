'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipSelectProps {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/** Toggleable chips for multi-select enums (languages, skills, categories…). */
export function ChipSelect({ options, value, onChange, max, size = 'md', className }: ChipSelectProps) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else if (!max || value.length < max) onChange([...value, opt]);
  };
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <motion.button
            type="button"
            key={opt}
            whileTap={{ scale: 0.92 }}
            onClick={() => toggle(opt)}
            aria-pressed={on}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border-2 font-semibold transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              on ? 'border-ink bg-lime text-ink' : 'border-line/20 bg-surface text-muted hover:border-fg/40 hover:text-fg dark:border-line'
            )}
          >
            {on && <Check className="h-3.5 w-3.5" />}
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}
