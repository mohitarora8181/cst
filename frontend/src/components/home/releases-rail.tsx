'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Users } from 'lucide-react';
import { SmartImage } from '@/components/media/smart-image';
import { formatDate } from '@/lib/utils';
import type { Release } from '@/types';

export function ReleasesRail({ releases }: { releases: Release[] }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-2 scrollbar-none sm:-mx-6 sm:px-6">
      {releases.map((r, i) => {
        const Wrapper = r.link ? 'a' : 'div';
        return (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="w-[240px] shrink-0 snap-start sm:w-[260px]"
          >
            <Wrapper {...(r.link ? { href: r.link, target: '_blank', rel: 'noreferrer' } : {})} className="group block">
              <div className="relative overflow-hidden rounded-3xl border-2 border-ink shadow-brutal transition group-hover:-translate-y-1 group-hover:shadow-brutal-lg dark:border-line">
                <SmartImage src={r.poster} alt={r.title} className="aspect-[2/3]" imgClassName="transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-90" />
                {r.platform && <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink">{r.platform}</span>}
                {r.link && <ArrowUpRight className="absolute right-3 top-3 h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-lime">{r.type}</p>
                  <h3 className="font-display text-2xl font-bold leading-tight">{r.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                    <span>{formatDate(r.releaseDate, { month: 'short', year: 'numeric' })}</span>
                    {r.castedCount ? <span className="inline-flex items-center gap-1 font-semibold text-white"><Users className="h-3.5 w-3.5" /> {r.castedCount} cast via CastLab</span> : null}
                  </div>
                </div>
              </div>
            </Wrapper>
          </motion.div>
        );
      })}
    </div>
  );
}
