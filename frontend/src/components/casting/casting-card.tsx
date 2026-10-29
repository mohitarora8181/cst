'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, IndianRupee, MapPin, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { SmartImage } from '@/components/media/smart-image';
import { Badge } from '@/components/ui/badge';
import { ageRange, cn } from '@/lib/utils';
import type { CastingCall } from '@/types';
import { Deadline } from './deadline';
import { MatchBadge } from './match-badge';
import { StatusPill } from './status-pill';

export function CastingCard({ casting: c, index = 0, compact }: { casting: CastingCall; index?: number; compact?: boolean }) {
  const tilt = index % 2 === 0 ? -1 : 1;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: tilt * 0.6 }}
      className="card card-hover group relative flex flex-col overflow-hidden"
    >
      <Link href={`/castings/${c._id}`} className="absolute inset-0 z-10" aria-label={`${c.roleName} — ${c.projectName}`} />
      <div className={cn('relative', compact ? 'h-36' : 'h-44')}>
        <SmartImage src={c.coverImage} alt={c.projectName} className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone="sun">{c.projectType}</Badge>
          {c.isUrgent && <Badge tone="pink" className="animate-pulse">Urgent</Badge>}
        </div>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-lime text-ink opacity-0 transition group-hover:rotate-45 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
        <div className="absolute inset-x-3 bottom-3 text-white">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-white/70">{c.projectName}{c.productionHouse ? ` · ${c.productionHouse}` : ''}</p>
          <h3 className="truncate font-display text-xl font-bold">{c.roleName}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm text-muted">{c.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-fg/80">
          <span>{c.gender === 'Any' ? 'Any gender' : c.gender} · {ageRange(c.ageMin, c.ageMax)}</span>
          {c.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.location}</span>}
          <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{c.isPaid ? c.compensation || 'Paid' : 'Unpaid'}</span>
          {c.selfTapeRequired && <span className="inline-flex items-center gap-1 text-violet"><Video className="h-3.5 w-3.5" />Self-tape</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t-2 border-dashed border-line/15 pt-3 dark:border-line">
          <Deadline date={c.deadline} />
          <div className="relative z-20 flex items-center gap-2">
            {c.applicationStatus ? (
              <StatusPill status={c.applicationStatus} />
            ) : c.match ? (
              <MatchBadge match={c.match} />
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted"><Users className="h-3.5 w-3.5" />{c.applicationsCount} applied</span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function CastingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-8 w-full" />
      </div>
    </div>
  );
}
