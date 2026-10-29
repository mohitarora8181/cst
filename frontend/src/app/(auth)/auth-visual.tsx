'use client';

import { motion } from 'framer-motion';
import { Clapperboard, Sparkles, Star } from 'lucide-react';

const QUOTES = [
  ['Got shortlisted for my first web series within a week.', 'Ishita · Hyderabad'],
  ['Smart Match saved our team 20 hours on a single brief.', 'Casting Director · Mumbai'],
];

export function AuthVisual() {
  return (
    <div className="relative hidden overflow-hidden border-l-2 border-ink bg-violet lg:block dark:border-line">
      <div aria-hidden className="absolute -left-20 top-20 h-96 w-96 animate-blob rounded-full bg-pink/60 blur-3xl" />
      <div aria-hidden className="absolute bottom-0 right-0 h-96 w-96 animate-blob rounded-full bg-lime/40 blur-3xl [animation-delay:-6s]" />
      <div className="dotted-bg absolute inset-0 opacity-40" />

      <div className="relative flex h-full flex-col justify-between p-14 text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-sun px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink">
          <Sparkles className="h-3.5 w-3.5" /> Lights · Camera · Apply
        </motion.div>

        <div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-7xl font-extrabold leading-[0.88] tracking-tighter xl:text-8xl">
            Your<br />story<br /><span className="text-lime">starts</span><br />here.
          </motion.h2>
        </div>

        <div className="space-y-4">
          {QUOTES.map(([q, who], i) => (
            <motion.div key={who} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }} className={`max-w-sm rounded-3xl border-2 border-ink bg-white p-5 text-ink shadow-[6px_6px_0_0_#16131e] ${i % 2 ? 'ml-auto rotate-2' : '-rotate-1'}`}>
              <div className="mb-2 flex text-sun">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
              <p className="font-display text-lg font-bold leading-snug">“{q}”</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink/60"><Clapperboard className="h-3.5 w-3.5" /> {who}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
