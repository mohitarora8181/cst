'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import { SmartImage } from '@/components/media/smart-image';
import { cn } from '@/lib/utils';
import type { ArtistProfile } from '@/types';

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
const TAPES = ['bg-lime', 'bg-pink', 'bg-sun', 'bg-sky', 'bg-violet'];

/** Polaroid-style artist card used on the homepage and listings. */
export function ArtistCard({ artist, index = 0 }: { artist: ArtistProfile; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.07 }}
      whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
      className={cn('group relative', TILTS[index % TILTS.length])}
    >
      <span className={cn('absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[-4deg] border border-ink/20 opacity-90', TAPES[index % TAPES.length])} />
      <Link href={`/artists/${artist.slug}`} className="block rounded-2xl border-2 border-ink bg-surface p-2.5 pb-4 shadow-brutal transition-shadow group-hover:shadow-brutal-lg dark:border-line">
        <SmartImage src={artist.headshot} alt={artist.stageName || 'Artist'} className="aspect-[4/5] rounded-xl" imgClassName="grayscale-[30%] transition duration-500 group-hover:grayscale-0 group-hover:scale-105" />
        <div className="px-1.5 pt-3">
          <p className="flex items-center gap-1 truncate font-display text-lg font-bold">
            {artist.stageName}
            {artist.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 fill-sky text-ink" />}
          </p>
          <p className="flex items-center gap-1 truncate text-xs text-muted">
            <MapPin className="h-3 w-3" /> {artist.city || 'India'}{artist.age ? ` · ${artist.age} yrs` : ''}
          </p>
          {artist.categories?.length > 0 && (
            <p className="mt-2 truncate text-[11px] font-bold uppercase tracking-wider text-pink">{artist.categories.slice(0, 2).join(' · ')}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
