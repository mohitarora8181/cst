'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Clapperboard, Eye, Inbox, Palette, Plus, Search, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { StatCard, SectionCard, StatusPill, Deadline } from '@/components/agency/shared';
import { PageHeader } from '@/components/layout/app-shell';
import { ButtonLink } from '@/components/ui/button';
import { Avatar, EmptyState, Skeleton } from '@/components/ui/misc';
import { cn, formatDate, PIPELINE, STATUS_META, timeAgo } from '@/lib/utils';
import type { Application, ApplicationStatus, ArtistProfile, CastingCall } from '@/types';

interface Stats {
  totals: { artists: number; verified: number; openCalls: number; totalCalls: number; applications: number; selected: number };
  funnel: Partial<Record<ApplicationStatus, number>>;
  signups: { week: string; count: number }[];
  genderSplit: { gender: string; count: number }[];
  topCalls: Pick<CastingCall, '_id' | 'title' | 'roleName' | 'projectName' | 'applicationsCount' | 'deadline' | 'views'>[];
  recent: (Omit<Application, 'profile' | 'castingCall'> & { profile: Pick<ArtistProfile, '_id' | 'stageName' | 'headshot' | 'slug'> | null; castingCall: Pick<CastingCall, '_id' | 'roleName' | 'projectName'> | null })[];
}

const GENDER_COLORS = ['bg-pink', 'bg-sky', 'bg-violet', 'bg-sun', 'bg-lime'];

/** Last 8 weeks, zero-filled so the chart always has a full x-axis. */
function weeklySeries(signups: Stats['signups']) {
  const map = new Map(signups.map((s) => [new Date(s.week).toISOString().slice(0, 10), s.count]));
  const now = new Date();
  const sunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(sunday.getTime() - (7 - i) * 7 * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), count: map.get(key) ?? 0 };
  });
}

export default function AgencyOverview() {
  const { data, isLoading } = useSWR<Stats>('/agency/stats');

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
        <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72 rounded-3xl" /><Skeleton className="h-72 rounded-3xl" /></div>
      </div>
    );
  }

  const { totals, funnel, genderSplit, topCalls, recent } = data;
  const funnelMax = Math.max(1, ...PIPELINE.map((s) => funnel[s] ?? 0));
  const weeks = weeklySeries(data.signups);
  const weekMax = Math.max(1, ...weeks.map((w) => w.count));
  const genderTotal = genderSplit.reduce((n, g) => n + g.count, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Casting HQ"
        title={<>Today’s <span className="text-gradient">call sheet</span></>}
        description="A live pulse of your talent pool, open roles and the audition pipeline."
        actions={
          <>
            <ButtonLink href="/agency/talent" variant="outline"><Search className="h-4 w-4" />Search talent</ButtonLink>
            <ButtonLink href="/agency/castings/new"><Plus className="h-4 w-4" />Post casting</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Artists" value={totals.artists} icon={Users} tone="lime" hint={`${totals.verified} verified`} />
        <StatCard label="Open calls" value={totals.openCalls} icon={Clapperboard} tone="pink" hint={`${totals.totalCalls} total posted`} delay={0.05} />
        <StatCard label="Applications" value={totals.applications} icon={Inbox} tone="violet" hint="Across all castings" delay={0.1} />
        <StatCard label="Selected" value={totals.selected} icon={Trophy} tone="sun" hint="Artists cast" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <SectionCard title="Application funnel" className="lg:col-span-3">
          <div className="space-y-3">
            {PIPELINE.map((s, i) => {
              const v = funnel[s] ?? 0;
              return (
                <div key={s} className="grid grid-cols-[110px_1fr_48px] items-center gap-3">
                  <span className="text-sm font-semibold">{STATUS_META[s].label}</span>
                  <div className="h-9 overflow-hidden rounded-xl border-2 border-ink/10 bg-surface-2 dark:border-line">
                    <motion.div
                      className={cn('h-full rounded-[10px] border-r-2 border-ink', STATUS_META[s].dot)}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, (v / funnelMax) * 100)}%` }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-right font-display text-lg font-bold tabular-nums">{v}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            Conversion to selection: <b className="text-fg">{totals.applications ? Math.round((totals.selected / totals.applications) * 100) : 0}%</b>
          </p>
        </SectionCard>

        <SectionCard title="New artists / week" className="lg:col-span-2">
          <div className="flex h-48 items-end gap-2">
            {weeks.map((w, i) => (
              <div key={w.label} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-bold tabular-nums text-muted opacity-0 transition group-hover:opacity-100">{w.count}</span>
                <motion.div
                  className={cn('w-full rounded-t-lg border-2 border-b-0 border-ink', i === weeks.length - 1 ? 'bg-pink' : 'bg-lime')}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (w.count / weekMax) * 140)}px` }}
                  transition={{ delay: 0.15 + i * 0.05, type: 'spring', bounce: 0.3 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2 border-t-2 border-ink/10 pt-2 dark:border-line">
            {weeks.map((w) => <span key={w.label} className="flex-1 truncate text-center text-[9px] text-muted">{w.label}</span>)}
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Gender split</p>
            <div className="flex h-4 overflow-hidden rounded-full border-2 border-ink">
              {genderSplit.map((g, i) => (
                <motion.div key={g.gender} className={GENDER_COLORS[i % GENDER_COLORS.length]} initial={{ width: 0 }} animate={{ width: `${(g.count / genderTotal) * 100}%` }} transition={{ delay: 0.3, duration: 0.8 }} title={`${g.gender}: ${g.count}`} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {genderSplit.map((g, i) => (
                <span key={g.gender} className="inline-flex items-center gap-1.5"><span className={cn('h-2.5 w-2.5 rounded-full', GENDER_COLORS[i % GENDER_COLORS.length])} />{g.gender} <b>{Math.round((g.count / genderTotal) * 100)}%</b></span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Hottest open calls" action={<Link href="/agency/castings" className="text-sm font-semibold text-pink hover:underline">All castings</Link>}>
          {!topCalls.length ? (
            <EmptyState icon={<Clapperboard />} title="No open calls" description="Post a casting to start receiving applications." action={<ButtonLink href="/agency/castings/new" size="sm">Post casting</ButtonLink>} />
          ) : (
            <ul className="space-y-2">
              {topCalls.map((c, i) => (
                <li key={c._id}>
                  <Link href={`/agency/castings/${c._id}`} className="group flex items-center gap-4 rounded-2xl border-2 border-transparent p-3 transition hover:border-ink hover:bg-surface-2 dark:hover:border-line">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-sun font-display text-lg font-extrabold text-ink">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{c.roleName} · <span className="text-muted">{c.projectName}</span></span>
                      <span className="mt-0.5 flex items-center gap-3 text-xs text-muted"><Deadline date={c.deadline} /><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{c.views}</span></span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-2xl font-extrabold tabular-nums">{c.applicationsCount}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted">applicants</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:rotate-45 group-hover:text-pink" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Fresh applications">
          {!recent.length ? (
            <EmptyState icon={<Inbox />} title="Nothing yet" description="New applications will land here." />
          ) : (
            <ul className="divide-y-2 divide-ink/5 dark:divide-line">
              {recent.map((a) => (
                <li key={a._id} className="flex items-center gap-3 py-3">
                  <Avatar src={a.profile?.headshot} name={a.profile?.stageName || 'Artist'} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {a.profile ? <Link href={`/agency/talent/${a.profile._id}`} className="hover:text-pink">{a.profile.stageName}</Link> : 'Artist'}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {a.castingCall ? <Link href={`/agency/castings/${a.castingCall._id}`} className="hover:underline">{a.castingCall.roleName} · {a.castingCall.projectName}</Link> : '—'} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/agency/castings/new', title: 'Post a casting', text: 'Brief, requirements & self-tape', icon: Plus, tone: 'bg-lime text-ink' },
          { href: '/agency/talent?verified=true', title: 'Verified talent', text: `${totals.verified} artists ready to book`, icon: BadgeCheck, tone: 'bg-sky text-ink' },
          { href: '/agency/cms', title: 'Edit homepage', text: 'Hero, banners & releases', icon: Palette, tone: 'bg-violet text-white' },
        ].map((q, i) => (
          <motion.div key={q.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
            <Link href={q.href} className="card card-hover flex items-center gap-4 p-5">
              <span className={cn('grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink', q.tone)}><q.icon className="h-5 w-5" /></span>
              <span className="flex-1"><span className="block font-display font-bold">{q.title}</span><span className="text-xs text-muted">{q.text}</span></span>
              <ArrowUpRight className="h-5 w-5 text-muted" />
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-muted">Updated {formatDate(new Date(), { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
    </div>
  );
}
