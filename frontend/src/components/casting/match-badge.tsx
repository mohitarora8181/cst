'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn, matchTone } from '@/lib/utils';
import type { Match } from '@/types';

/** Smart Match score pill; hover/tap reveals why it fits (and what's missing). */
export function MatchBadge({ match, className }: { match: Match; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={cn('relative inline-flex', className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className={cn('inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-1 text-xs font-extrabold', matchTone(match.score))}
      >
        <Sparkles className="h-3.5 w-3.5" /> {match.score}% match
      </button>
      <AnimatePresence>
        {open && (match.reasons.length > 0 || match.gaps.length > 0) && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="card absolute bottom-full right-0 z-30 mb-2 block w-60 p-3 text-left text-xs"
          >
            {match.reasons.map((r) => <span key={r} className="block py-0.5 text-fg">✓ {r}</span>)}
            {match.gaps.map((g) => <span key={g} className="block py-0.5 text-muted">✗ {g}</span>)}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
