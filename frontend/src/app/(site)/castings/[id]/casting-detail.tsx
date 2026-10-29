'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Eye, IndianRupee, Languages, MapPin, Ruler, Settings2, Sparkles, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { ApplyModal } from '@/components/casting/apply-modal';
import { Deadline } from '@/components/casting/deadline';
import { StatusPill, StatusTracker } from '@/components/casting/status-pill';
import { SmartImage } from '@/components/media/smart-image';
import { Reveal } from '@/components/motion/reveal';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState, ProgressRing, Skeleton } from '@/components/ui/misc';
import { useAuth } from '@/hooks/use-auth';
import { ageRange, formatDate } from '@/lib/utils';
import type { CastingCall } from '@/types';

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-ink/10 bg-surface p-4 dark:border-line">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink/15 text-pink"><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function CastingDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const { data, error, mutate } = useSWR<{ casting: CastingCall }>(`/castings/${id}`);
  const [applyOpen, setApplyOpen] = useState(false);

  if (error) {
    return (
      <div className="container py-20">
        <EmptyState title="Casting not found" description="This call may have been removed or is no longer public." action={<ButtonLink href="/castings">Browse open roles</ButtonLink>} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container space-y-6 py-10">
        <Skeleton className="h-80 w-full rounded-4xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]"><Skeleton className="h-96" /><Skeleton className="h-72" /></div>
      </div>
    );
  }

  const c = data.casting;
  const myApp = c.myApplication;

  const cta = (() => {
    if (!user) return <ButtonLink href={`/login?next=/castings/${c._id}`} size="lg" className="w-full">Sign in to apply</ButtonLink>;
    if (user.role === 'agency') return <ButtonLink href={`/agency/castings/${c._id}`} size="lg" variant="dark" className="w-full"><Settings2 className="h-5 w-5" /> Manage applicants</ButtonLink>;
    if (myApp) return null;
    if (!c.isAccepting) return <Button size="lg" disabled className="w-full">Applications closed</Button>;
    return <Button size="lg" className="w-full" onClick={() => setApplyOpen(true)}>Apply for this role</Button>;
  })();

  return (
    <div className="pb-10">
      <section className="container pt-4">
        <Link href="/castings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> All castings</Link>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[340px] overflow-hidden rounded-4xl border-2 border-ink shadow-brutal-lg sm:h-[400px] dark:border-line">
          <SmartImage src={c.coverImage} alt={c.projectName} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="sun">{c.projectType}</Badge>
              <Badge tone="violet">{c.roleType}</Badge>
              {c.isUrgent && <Badge tone="pink">Urgent</Badge>}
              {c.status !== 'open' && <Badge tone="default">{c.status}</Badge>}
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{c.projectName}{c.productionHouse && ` · ${c.productionHouse}`}</p>
            <h1 className="font-display text-4xl font-extrabold leading-none sm:text-6xl">{c.roleName}</h1>
            <p className="mt-2 max-w-2xl text-white/80 sm:text-lg">{c.title}</p>
          </div>
        </motion.div>
      </section>

      <div className="container mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <Reveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Fact icon={Users} label="Gender · Age" value={`${c.gender === 'Any' ? 'Any' : c.gender} · ${ageRange(c.ageMin, c.ageMax)}`} />
            {c.location && <Fact icon={MapPin} label="Location" value={c.location} />}
            <Fact icon={IndianRupee} label="Compensation" value={c.isPaid ? c.compensation || 'Paid' : 'Unpaid'} />
            {(c.heightMinCm || c.heightMaxCm) && <Fact icon={Ruler} label="Height" value={`${c.heightMinCm ?? '—'} – ${c.heightMaxCm ?? '—'} cm`} />}
            {(c.shootStart || c.shootEnd) && <Fact icon={CalendarDays} label="Shoot dates" value={`${formatDate(c.shootStart, { day: 'numeric', month: 'short' })} → ${formatDate(c.shootEnd, { day: 'numeric', month: 'short' })}`} />}
            {c.languages?.length > 0 && <Fact icon={Languages} label="Languages" value={c.languages.join(', ')} />}
          </Reveal>

          <Reveal>
            <h2 className="mb-3 text-2xl font-bold">About the project</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-fg/80">{c.description}</p>
          </Reveal>

          {c.characterBrief && (
            <Reveal>
              <div className="relative rounded-3xl border-2 border-ink bg-sun/20 p-6 dark:border-sun/40">
                <span className="absolute -top-3 left-6 rounded-full border-2 border-ink bg-sun px-3 py-0.5 text-xs font-bold uppercase text-ink">Character brief</span>
                <p className="whitespace-pre-line pt-2 font-display text-xl leading-snug">“{c.characterBrief}”</p>
              </div>
            </Reveal>
          )}

          {(c.skills?.length > 0 || c.categories?.length > 0) && (
            <Reveal>
              <h2 className="mb-3 text-2xl font-bold">Looking for</h2>
              <div className="flex flex-wrap gap-2">
                {[...(c.categories ?? []), ...(c.skills ?? [])].map((s) => <span key={s} className="rounded-full border-2 border-ink bg-lime/30 px-3 py-1 text-sm font-semibold dark:border-lime/40">{s}</span>)}
              </div>
            </Reveal>
          )}

          {c.selfTapeRequired && (
            <Reveal>
              <div className="rounded-3xl border-2 border-dashed border-violet bg-violet/5 p-6">
                <p className="mb-2 flex items-center gap-2 font-bold text-violet"><Video className="h-5 w-5" /> Self-tape required</p>
                <p className="whitespace-pre-line text-fg/80">{c.selfTapeInstructions || 'Record a short introduction and a scene of your choice.'}</p>
                <p className="mt-3 text-xs text-muted">Upload to Google Drive and share the link (Anyone with the link → Viewer) when applying.</p>
              </div>
            </Reveal>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="card space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Apply by</p>
                <p className="font-display text-xl font-bold">{formatDate(c.deadline)}</p>
              </div>
              <Deadline date={c.deadline} className="rounded-full bg-surface-2 px-3 py-1.5" />
            </div>

            {c.match && !myApp && (
              <div className="flex items-center gap-4 rounded-2xl bg-surface-2/60 p-4">
                <ProgressRing value={c.match.score} size={76} stroke={8} />
                <div className="min-w-0 text-sm">
                  <p className="mb-1 flex items-center gap-1 font-bold"><Sparkles className="h-4 w-4 text-pink" /> Your match</p>
                  {c.match.reasons.slice(0, 2).map((r) => <p key={r} className="truncate text-fg/80">✓ {r}</p>)}
                  {c.match.gaps.slice(0, 2).map((g) => <p key={g} className="truncate text-muted">✗ {g}</p>)}
                </div>
              </div>
            )}

            {myApp && (
              <div className="space-y-3 rounded-2xl border-2 border-ink/10 bg-surface-2/50 p-4 dark:border-line">
                <div className="flex items-center justify-between"><p className="text-sm font-bold">Your application</p><StatusPill status={myApp.status} /></div>
                <StatusTracker status={myApp.status} />
                <ButtonLink href="/dashboard?tab=applied" variant="outline" size="sm" className="w-full">Track in dashboard</ButtonLink>
              </div>
            )}

            {cta}

            <div className="flex justify-between border-t-2 border-dashed border-line/15 pt-4 text-xs font-semibold text-muted dark:border-line">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.applicationsCount} applied</span>
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {c.views} views</span>
            </div>
          </div>
          <p className="px-2 text-center text-xs text-muted">🔒 CastLab never charges artists to audition. Report any request for money.</p>
        </aside>
      </div>

      {user?.role === 'artist' && <ApplyModal casting={c} open={applyOpen} onClose={() => setApplyOpen(false)} onApplied={() => mutate()} />}
    </div>
  );
}
