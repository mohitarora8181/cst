'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn('relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border-2 border-ink bg-surface transition hover:bg-sun hover:text-ink dark:border-line', className)}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
    >
      {mounted && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={dark ? 'moon' : 'sun'} initial={{ y: 20, rotate: -90, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} exit={{ y: -20, rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
            {dark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
