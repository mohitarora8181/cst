'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Clapperboard, MapPin, Ruler, Video } from 'lucide-react';
import Link from 'next/link';
import { SmartImage } from '@/components/media/smart-image';
import { CountUp } from '@/components/motion/reveal';
import { cn, heightLabel, matchTone, STATUS_META, timeLeft } from '@/lib/utils';
import type { ApplicationStatus, ArtistProfile, CastingStatus } from '@/types';

export function StatusPill({ status, className }: { status: ApplicationStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', meta.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

const CASTING_STATUS_TONE: Record<CastingStatus, string> = {
  open: 'bg-lime text-ink border-ink',
  draft: 'bg-surface-2 text-muted border-line/30',
  closed: 'bg-ink text-white border-ink dark:bg-surface-2 dark:text-muted',
};

export function CastingStatusPill({ status, accepting }: { status: CastingStatus; accepting?: boolean }) {
  const label = status === 'open' && accepting === false ? 'Expired' : status;
  const tone = status === 'open' && accepting === false ? 'bg-tangerine text-ink border-ink' : CASTING_STATUS_TONE[status];
  return <span className={cn('inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', tone)}>{label}</span>;
}

export function MatchBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-extrabold tabular-nums', matchTone(score), className)} title="Smart match score">
      {score}% match
    </span>
  );
}

export function Deadline({ date }: { date: string }) {
  const t = timeLeft(date);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', t.closed ? 'text-muted' : t.urgent ? 'text-pink' : 'text-fg/80')}>
      <Clapperboard className="h-3.5 w-3.5" /> {t.label}
    </span>
  );
}

const STAT_TONES = {
  lime: 'bg-lime text-ink',
  pink: 'bg-pink text-white',
  violet: 'bg-violet text-white',
  sun: 'bg-sun text-ink',
  sky: 'bg-sky text-ink',
} as const;

export function StatCard({ label, value, icon: Icon, tone = 'lime', hint, delay = 0 }: {
  label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; tone?: keyof typeof STAT_TONES; hint?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl border-2 border-ink', STAT_TONES[tone])}><Icon className="h-5 w-5" /></span>
      </div>
      <CountUp value={value} className="mt-3 block font-display text-4xl font-extrabold tabular-nums" />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}

export const AVAILABILITY_DOT: Record<string, string> = { available: 'bg-success', busy: 'bg-tangerine', 'on-shoot': 'bg-violet' };

/** Compact artist tile used in talent search, suggestions and boards. */
export function TalentTile({ profile, href, actions, footer, selected }: {
  profile: ArtistProfile; href?: string; actions?: React.ReactNode; footer?: React.ReactNode; selected?: boolean;
}) {
  const link = href ?? `/agency/talent/${profile._id}`;
  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn('card card-hover group overflow-hidden', selected && 'ring-4 ring-pink')}>
      <Link href={link} className="relative block">
        <SmartImage src={profile.headshot} alt={profile.stageName || 'Artist'} className="aspect-[4/5]" imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10 text-white">
          <p className="flex items-center gap-1.5 font-display text-lg font-bold leading-tight">
            <span className="truncate">{profile.stageName || 'Unnamed'}</span>
            {profile.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 fill-sky text-ink" />}
          </p>
          <p className="truncate text-xs text-white/75">{[profile.age && `${profile.age} yrs`, profile.gender].filter(Boolean).join(' · ') || '—'}</p>
        </div>
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          <span className={cn('h-1.5 w-1.5 rounded-full', AVAILABILITY_DOT[profile.availability] ?? 'bg-muted')} />
          {profile.availability}
        </span>
        {(profile.videoCount ?? profile.videos?.length ?? 0) > 0 && (
          <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur" title="Has video"><Video className="h-3.5 w-3.5" /></span>
        )}
      </Link>
      <div className="space-y-2 p-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {profile.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.city}</span>}
          {profile.heightCm && <span className="inline-flex items-center gap-1"><Ruler className="h-3 w-3" />{heightLabel(profile.heightCm).split(' · ')[1]}</span>}
        </div>
        {footer}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}

export function SectionCard({ title, icon, action, children, className }: { title: React.ReactNode; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('card p-5 sm:p-6', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">{icon}{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
