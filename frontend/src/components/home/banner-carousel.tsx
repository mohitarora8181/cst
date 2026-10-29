'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SmartImage } from '@/components/media/smart-image';
import type { Banner } from '@/types';

const INTERVAL = 6000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback((d: number) => setState(([i]) => [(i + d + count) % count, d]), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(t);
  }, [paused, count, go, index]);

  if (!count) return null;
  const b = banners[index];

  return (
    <section className="container py-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[420px] overflow-hidden rounded-4xl border-2 border-ink shadow-brutal-lg sm:h-[380px] dark:border-line">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={b._id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0.4 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', bounce: 0.1, duration: 0.8 }}
            className="absolute inset-0"
          >
            <SmartImage src={b.image} alt={b.title} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end gap-4 p-8 sm:justify-center sm:p-14">
              <motion.span initial={{ width: 0 }} animate={{ width: 64 }} transition={{ delay: 0.3 }} className="h-2 rounded-full" style={{ background: b.accent }} />
              <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                {b.title}
              </motion.h2>
              {b.subtitle && (
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-lg text-white/75 sm:text-lg">{b.subtitle}</motion.p>
              )}
              {b.ctaLabel && b.ctaLink && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Link href={b.ctaLink} className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-ink px-6 font-bold text-ink shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5" style={{ background: b.accent }}>
                    {b.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
              <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-white text-ink transition hover:bg-lime" aria-label="Previous banner"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-white text-ink transition hover:bg-lime" aria-label="Next banner"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="absolute left-8 top-6 z-10 flex gap-1.5 sm:left-14">
              {banners.map((x, i) => (
                <button key={x._id} onClick={() => setState([i, i > index ? 1 : -1])} className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/30" aria-label={`Banner ${i + 1}`}>
                  {i === index && (
                    <motion.span key={`${index}-${paused}`} className="absolute inset-y-0 left-0 bg-white" initial={{ width: '0%' }} animate={{ width: paused ? '0%' : '100%' }} transition={{ duration: paused ? 0 : INTERVAL / 1000, ease: 'linear' }} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
