'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, CheckCircle2, Circle, Clapperboard, Eye, Inbox, Search, Sparkles, Star, Trophy } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { ApplicationCard } from '@/components/artist/application-card';
import { CastingCard, CastingCardSkeleton } from '@/components/casting/casting-card';
import { PageHeader } from '@/components/layout/app-shell';
import { CountUp } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, Pagination, ProgressRing, Skeleton } from '@/components/ui/misc';
import { Tabs } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { api, errorMessage, toQuery } from '@/lib/api';
import { cn, formatDateTime } from '@/lib/utils';
import type { Application, Availability, CastingCall, ChecklistItem, Paginated } from '@/types';

type Tab = 'open' | 'applied' | 'closed';

interface Overview {
  stats: Partial<Record<'applied' | 'shortlisted' | 'audition' | 'selected' | 'rejected' | 'total', number>>;
  upcomingAuditions: Application[];
  profile: { slug: string; completeness: number; profileViews: number; availability: Availability; isVerified: boolean; checklist: ChecklistItem[] } | null;
}

interface Feed extends Paginated<CastingCall | Application> { tab: Tab; counts: Record<Tab, number> }

const STAT_CARDS = [
  { key: 'total', label: 'Applications', icon: Inbox, tone: 'bg-sky' },
  { key: 'shortlisted', label: 'Shortlisted', icon: Star, tone: 'bg-violet text-white' },
  { key: 'audition', label: 'Auditions', icon: CalendarClock, tone: 'bg-sun' },
  { key: 'selected', label: 'Selected', icon: Trophy, tone: 'bg-lime' },
] as const;

const AVAILABILITY: { value: Availability; label: string; dot: string }[] = [
  { value: 'available', label: 'Available', dot: 'bg-lime' },
  { value: 'busy', label: 'Busy', dot: 'bg-tangerine' },
  { value: 'on-shoot', label: 'On shoot', dot: 'bg-violet' },
];

function AvailabilityToggle({ value, onChange }: { value: Availability; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const set = async (availability: Availability) => {
    if (availability === value) return;
    setBusy(true);
    try {
      await api.put('/profiles/me', { availability });
      onChange();
      refresh();
      toast.success(`Status set to “${AVAILABILITY.find((a) => a.value === availability)?.label}”`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={cn('flex gap-1 rounded-2xl border-2 border-ink bg-surface p-1 dark:border-line', busy && 'opacity-60')}>
      {AVAILABILITY.map((a) => (
        <button key={a.value} onClick={() => set(a.value)} className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition', value === a.value ? 'bg-ink text-white dark:bg-fg dark:text-bg' : 'text-muted hover:text-fg')}>
          <span className={cn('h-2 w-2 rounded-full', a.dot)} /> {a.label}
        </button>
      ))}
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const tab = (['open', 'applied', 'closed'].includes(sp.get('tab') ?? '') ? sp.get('tab') : 'open') as Tab;
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const dq = useDebounce(q);

  const { data: overview, mutate: mutateOverview } = useSWR<Overview>('/artist/overview');
  const { data: feed, isLoading, mutate: mutateFeed } = useSWR<Feed>(`/artist/feed${toQuery({ tab, page, q: dq, limit: 9 })}`, { keepPreviousData: true });

  const setTab = (t: Tab) => {
    setPage(1);
    router.replace(`${pathname}?tab=${t}`, { scroll: false });
  };
  const refreshAll = () => { mutateFeed(); mutateOverview(); };

  // With keepPreviousData, `feed` can still hold the previous tab's items while the new tab loads.
  // Render by the tab the data belongs to, never by the requested tab.
  const shownTab = feed?.tab ?? tab;
  const stale = Boolean(feed && feed.tab !== tab);

  const p = overview?.profile;
  const todo = p?.checklist.filter((c) => !c.done) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Artist dashboard"
        title={<>Hey {user?.name.split(' ')[0]}, <span className="text-gradient">break a leg!</span></>}
        description="Your castings, applications and callbacks — all in one place."
        actions={p && <AvailabilityToggle value={p.availability} onChange={mutateOverview} />}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-5">
              <span className={cn('mb-4 grid h-11 w-11 place-items-center rounded-xl border-2 border-ink text-ink', s.tone)}><s.icon className="h-5 w-5" /></span>
              <p className="font-display text-4xl font-extrabold">{overview ? <CountUp value={overview.stats[s.key] ?? 0} /> : '–'}</p>
              <p className="text-sm font-semibold text-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="card flex items-center gap-5 p-5 xl:row-span-2">
          {p ? (
            <>
              <ProgressRing value={p.completeness} size={110} stroke={11} />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-display text-lg font-bold">Profile strength</p>
                <ul className="space-y-1 text-xs">
                  {(todo.length ? todo.slice(0, 4) : p.checklist.slice(0, 3)).map((c) => (
                    <li key={c.key} className={cn('flex items-center gap-1.5', c.done ? 'text-muted line-through' : 'text-fg')}>
                      {c.done ? <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> : <Circle className="h-3.5 w-3.5 text-pink" />} {c.label}
                      {!c.done && <span className="ml-auto font-bold text-pink">+{c.weight}</span>}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
                  <Link href="/dashboard/profile" className="text-pink hover:underline">{todo.length ? 'Complete profile →' : 'Edit profile →'}</Link>
                  <Link href={`/artists/${p.slug}`} className="inline-flex items-center gap-1 text-muted hover:text-fg"><Eye className="h-3.5 w-3.5" /> {p.profileViews} views</Link>
                </div>
              </div>
            </>
          ) : (
            <Skeleton className="h-28 w-full" />
          )}
        </div>

        {overview && overview.upcomingAuditions.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b-2 border-ink/10 bg-sun/20 px-5 py-3 dark:border-line">
              <CalendarClock className="h-4 w-4 text-pink" /><p className="text-sm font-bold">Upcoming auditions</p>
            </div>
            <div className="flex gap-3 overflow-x-auto p-4 scrollbar-none">
              {overview.upcomingAuditions.map((a) => {
                const c = a.castingCall as CastingCall;
                return (
                  <button key={a._id} onClick={() => setTab(c.isAccepting === false ? 'closed' : 'applied')} className="min-w-[220px] rounded-2xl border-2 border-ink/10 bg-surface-2/60 p-3 text-left transition hover:border-pink dark:border-line">
                    <p className="text-xs font-bold text-pink">{formatDateTime(a.audition?.scheduledAt)}</p>
                    <p className="truncate font-bold">{c.roleName}</p>
                    <p className="truncate text-xs text-muted">{c.projectName} · {a.audition?.mode}</p>
                    <p className={cn('mt-1 text-[10px] font-bold uppercase', a.audition?.response === 'confirmed' ? 'text-success' : 'text-tangerine')}>{a.audition?.response === 'pending' ? 'Awaiting your RSVP' : a.audition?.response}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: 'open', label: 'Open', icon: <Sparkles className="h-4 w-4" />, count: feed?.counts.open },
            { value: 'applied', label: 'Applied', icon: <Inbox className="h-4 w-4" />, count: feed?.counts.applied },
            { value: 'closed', label: 'Closed', icon: <Clapperboard className="h-4 w-4" />, count: feed?.counts.closed },
          ]}
        />
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search roles…" className="h-11 pl-10" />
        </div>
      </div>

      {tab === 'open' && <p className="mt-4 text-sm text-muted"><Sparkles className="mr-1 inline h-4 w-4 text-pink" />Ranked by <b>Smart Match</b> — roles that fit your profile best come first.</p>}

      <div className={cn('mt-6 transition-opacity', stale && 'pointer-events-none opacity-50')}>
        {isLoading && !feed ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <CastingCardSkeleton key={i} />)}</div>
        ) : !feed?.items.length ? (
          shownTab === 'open' ? (
            <EmptyState icon={<Sparkles />} title="You’ve applied to everything open!" description="New castings drop all the time — we’ll ping you when one matches your profile." action={<ButtonLink href="/castings" variant="outline">Browse all castings</ButtonLink>} />
          ) : shownTab === 'applied' ? (
            <EmptyState icon={<Inbox />} title="No active applications yet" description="Find a role that fits and hit apply — it takes 30 seconds." action={<ButtonLink onClick={() => setTab('open')} href="?tab=open">See open roles <ArrowRight className="h-4 w-4" /></ButtonLink>} />
          ) : (
            <EmptyState icon={<Clapperboard />} title="Nothing closed yet" description="Applications move here once the casting call wraps up." />
          )
        ) : shownTab === 'open' ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {(feed.items as CastingCall[]).map((c, i) => <CastingCard key={c._id} casting={c} index={i} />)}
          </div>
        ) : (
          <div className="space-y-5">
            {(feed.items as Application[]).map((a) => <ApplicationCard key={a._id} application={a} onChange={refreshAll} />)}
          </div>
        )}
        <div className="mt-8"><Pagination page={feed?.page ?? 1} pages={feed?.pages ?? 1} onChange={setPage} /></div>
      </div>
    </>
  );
}

export default function ArtistDashboardPage() {
  return <Suspense><DashboardContent /></Suspense>;
}
