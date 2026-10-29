'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  ArrowLeft, BookmarkPlus, CalendarClock, Download, Eye, FileVideo, KanbanSquare, List, Lock, Pencil, Sparkles, Unlock, Users, Wand2, X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { AddToBoardModal } from '@/components/agency/add-to-board-modal';
import { ageOf, ApplicantDrawer, type PopulatedApplication } from '@/components/agency/applicant-drawer';
import { CastingStatusPill, Deadline, MatchBadge, StatusPill, TalentTile } from '@/components/agency/shared';
import { SmartImage } from '@/components/media/smart-image';
import { Button, ButtonLink, buttonClass } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { EmptyState, Skeleton, Stars } from '@/components/ui/misc';
import { Tabs } from '@/components/ui/tabs';
import { api, errorMessage } from '@/lib/api';
import { ageRange, cn, formatDate, PIPELINE, STATUS_META } from '@/lib/utils';
import type { ApplicationStatus, ArtistProfile, CastingCall, Match } from '@/types';

type View = 'board' | 'list';
type Section = 'pipeline' | 'suggestions';
type Sort = 'match' | 'rating' | 'recent';

interface AppsResponse {
  items: PopulatedApplication[];
  counts: Partial<Record<ApplicationStatus, number>>;
  total: number;
}

export default function CastingPipelinePage() {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<Section>('pipeline');
  const [view, setView] = useState<View>('board');
  const [sort, setSort] = useState<Sort>('match');
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const { data: castingData, mutate: mutateCasting } = useSWR<{ casting: CastingCall }>(`/castings/${id}`);
  const { data, isLoading, mutate } = useSWR<AppsResponse>(`/castings/${id}/applications?limit=500&sort=${sort}`, { keepPreviousData: true });

  const casting = castingData?.casting;
  const apps = useMemo(() => data?.items ?? [], [data]);
  const openApp = apps.find((a) => a._id === openId) ?? null;
  const byStatus = useMemo(() => Object.fromEntries(PIPELINE.map((s) => [s, apps.filter((a) => a.status === s)])) as Record<ApplicationStatus, PopulatedApplication[]>, [apps]);

  const refresh = useCallback(() => { mutate(); }, [mutate]);

  const move = async (appId: string, status: ApplicationStatus) => {
    const app = apps.find((a) => a._id === appId);
    if (!app || app.status === status) return;
    // optimistic move
    mutate((prev) => prev && { ...prev, items: prev.items.map((a) => (a._id === appId ? { ...a, status } : a)) }, { revalidate: false });
    try {
      await api.patch(`/applications/${appId}`, { status });
      toast.success(`${app.profile.stageName || app.artist.name} → ${STATUS_META[status].label}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      mutate();
    }
  };

  const bulk = async (status: ApplicationStatus) => {
    setBulkBusy(true);
    try {
      const res = await api.patch<{ updated: number }>('/applications/bulk/status', { ids: selected, status });
      toast.success(`${res.updated} moved to ${STATUS_META[status].label}`);
      setSelected([]);
      mutate();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBulkBusy(false);
    }
  };

  const toggleStatus = async () => {
    if (!casting) return;
    const next = casting.status === 'open' ? 'closed' : 'open';
    try {
      await api.patch(`/castings/${casting._id}/status`, { status: next });
      toast.success(next === 'open' ? 'Casting reopened' : 'Casting closed');
      mutateCasting();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const toggleSelect = (appId: string) => setSelected((s) => (s.includes(appId) ? s.filter((x) => x !== appId) : [...s, appId]));

  if (!casting) {
    return <div className="space-y-4"><Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-[50vh] rounded-3xl" /></div>;
  }

  return (
    <div className="pb-24">
      <Link href="/agency/castings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All castings</Link>

      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 overflow-hidden sm:flex">
        <SmartImage src={casting.coverImage} alt={casting.projectName} className="h-40 sm:h-auto sm:w-64 sm:shrink-0" />
        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CastingStatusPill status={casting.status} accepting={casting.isAccepting} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted">{casting.projectType} · {casting.projectName}</span>
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{casting.roleName}</h1>
            <p className="mt-1 line-clamp-1 text-muted">{casting.title}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span>{casting.gender === 'Any' ? 'Any gender' : casting.gender} · {ageRange(casting.ageMin, casting.ageMax)}</span>
              <Deadline date={casting.deadline} />
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{casting.views} views</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{data?.total ?? casting.applicationsCount} applicants</span>
              {casting.selfTapeRequired && <span className="inline-flex items-center gap-1 text-pink"><FileVideo className="h-3.5 w-3.5" />Self-tape required</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/castings/${casting._id}/applications/export`} className={buttonClass('outline', 'sm')}><Download className="h-4 w-4" />Export CSV</a>
            <ButtonLink href={`/agency/castings/${casting._id}/edit`} size="sm" variant="outline"><Pencil className="h-4 w-4" />Edit</ButtonLink>
            <Button size="sm" variant={casting.status === 'open' ? 'dark' : 'primary'} onClick={toggleStatus}>
              {casting.status === 'open' ? <><Lock className="h-4 w-4" />Close</> : <><Unlock className="h-4 w-4" />Reopen</>}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          items={[
            { value: 'pipeline' as Section, label: 'Pipeline', icon: <KanbanSquare className="h-4 w-4" />, count: data?.total },
            { value: 'suggestions' as Section, label: 'Smart suggestions', icon: <Wand2 className="h-4 w-4" /> },
          ]}
          value={section}
          onChange={setSection}
        />
        {section === 'pipeline' && (
          <div className="flex items-center gap-2">
            <div className="w-44"><Select value={sort} onChange={(e) => setSort((e.target.value || 'match') as Sort)} options={[{ value: 'match', label: 'Best match' }, { value: 'rating', label: 'Top rated' }, { value: 'recent', label: 'Most recent' }]} placeholder="Sort" className="h-10" /></div>
            <div className="flex rounded-xl border-2 border-ink p-0.5 dark:border-line">
              {([['board', KanbanSquare], ['list', List]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)} className={cn('grid h-8 w-9 place-items-center rounded-lg transition', view === v ? 'bg-lime text-ink' : 'text-muted hover:text-fg')} aria-label={`${v} view`}><Icon className="h-4 w-4" /></button>
              ))}
            </div>
          </div>
        )}
      </div>

      {section === 'suggestions' ? (
        <Suggestions castingId={casting._id} />
      ) : isLoading && !data ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">{PIPELINE.map((s) => <Skeleton key={s} className="h-96 rounded-3xl" />)}</div>
      ) : !apps.length ? (
        <EmptyState icon={<Users />} title="No applicants yet" description="Check Smart suggestions for artists who fit this brief — then invite them to apply." action={<Button size="sm" onClick={() => setSection('suggestions')}><Sparkles className="h-4 w-4" />See suggestions</Button>} />
      ) : view === 'board' ? (
        <LayoutGroup>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 scrollbar-none 2xl:mx-0 2xl:grid 2xl:grid-cols-5 2xl:overflow-visible 2xl:px-0">
            {PIPELINE.map((status) => (
              <div
                key={status}
                onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
                onDragLeave={() => setDragOver((d) => (d === status ? null : d))}
                onDrop={(e) => { e.preventDefault(); setDragOver(null); move(e.dataTransfer.getData('text/plain'), status); }}
                className={cn('flex w-72 shrink-0 snap-start flex-col rounded-3xl border-2 border-dashed p-3 transition 2xl:w-auto', dragOver === status ? 'border-pink bg-pink/5' : 'border-line/20 bg-surface-2/40 dark:border-line')}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="flex items-center gap-2 text-sm font-bold"><span className={cn('h-2.5 w-2.5 rounded-full', STATUS_META[status].dot)} />{STATUS_META[status].label}</p>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold tabular-nums">{byStatus[status].length}</span>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {byStatus[status].map((a) => (
                      <ApplicantCard key={a._id} app={a} selected={selected.includes(a._id)} onSelect={() => toggleSelect(a._id)} onOpen={() => setOpenId(a._id)} />
                    ))}
                  </AnimatePresence>
                  {!byStatus[status].length && <p className="py-6 text-center text-xs text-muted">Drop applicants here</p>}
                </div>
              </div>
            ))}
          </div>
        </LayoutGroup>
      ) : (
        <ApplicantTable apps={apps} selected={selected} setSelected={setSelected} onOpen={setOpenId} />
      )}

      <AnimatePresence>
        {selected.length > 0 && section === 'pipeline' && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border-2 border-ink bg-ink p-3 text-white shadow-brutal-lg">
            <span className="px-2 text-sm font-bold">{selected.length} selected</span>
            <span className="text-xs text-white/50">Move to:</span>
            {PIPELINE.map((s) => (
              <button key={s} disabled={bulkBusy} onClick={() => bulk(s)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-bold transition hover:bg-lime hover:text-ink disabled:opacity-50">
                <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />{STATUS_META[s].label}
              </button>
            ))}
            <button onClick={() => setSelected([])} className="ml-auto rounded-lg p-1.5 hover:bg-white/10" aria-label="Clear selection"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <ApplicantDrawer app={openApp} onClose={() => setOpenId(null)} onChanged={refresh} />
    </div>
  );
}

function ApplicantCard({ app, selected, onSelect, onOpen }: { app: PopulatedApplication; selected: boolean; onSelect: () => void; onOpen: () => void }) {
  const p = app.profile;
  const age = ageOf(p);
  return (
    <motion.div
      layout
      layoutId={app._id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
      draggable
      onDragStartCapture={(e: React.DragEvent) => e.dataTransfer.setData('text/plain', app._id)}
      className={cn('group relative cursor-grab rounded-2xl border-2 border-ink bg-surface p-3 shadow-brutal-sm transition-shadow hover:shadow-brutal active:cursor-grabbing dark:border-line', selected && 'ring-4 ring-pink')}
    >
      <input type="checkbox" checked={selected} onChange={onSelect} onClick={(e) => e.stopPropagation()} className="absolute right-3 top-3 h-4 w-4 accent-pink" aria-label="Select applicant" />
      <button onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <SmartImage src={p.headshot} alt={p.stageName || ''} className="h-14 w-14 shrink-0 rounded-xl border-2 border-ink" />
        <div className="min-w-0 flex-1 pr-5">
          <p className="truncate font-semibold">{p.stageName || app.artist.name}</p>
          <p className="truncate text-xs text-muted">{[age && `${age}y`, p.city, p.heightCm && `${p.heightCm}cm`].filter(Boolean).join(' · ')}</p>
        </div>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <MatchBadge score={app.matchScore} />
        <div className="flex items-center gap-1.5">
          {app.selfTapeUrl && <span title="Self-tape attached" className="grid h-6 w-6 place-items-center rounded-md bg-pink/15 text-pink"><FileVideo className="h-3.5 w-3.5" /></span>}
          {app.audition?.scheduledAt && <span title="Audition scheduled" className="grid h-6 w-6 place-items-center rounded-md bg-sun/30 text-amber-700 dark:text-sun"><CalendarClock className="h-3.5 w-3.5" /></span>}
        </div>
      </div>
      {(app.rating ?? 0) > 0 && <div className="mt-2"><Stars value={app.rating ?? 0} size={12} /></div>}
    </motion.div>
  );
}

function ApplicantTable({ apps, selected, setSelected, onOpen }: { apps: PopulatedApplication[]; selected: string[]; setSelected: (s: string[]) => void; onOpen: (id: string) => void }) {
  const all = apps.length > 0 && selected.length === apps.length;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b-2 border-ink/10 text-left text-xs uppercase tracking-wider text-muted dark:border-line">
            <th className="w-10 p-4"><input type="checkbox" checked={all} onChange={() => setSelected(all ? [] : apps.map((a) => a._id))} className="h-4 w-4 accent-pink" aria-label="Select all" /></th>
            <th className="p-4">Artist</th>
            <th className="p-4">Match</th>
            <th className="p-4">Rating</th>
            <th className="p-4">Status</th>
            <th className="p-4">Tape</th>
            <th className="p-4">Applied</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a, i) => (
            <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }} className="cursor-pointer border-b border-ink/5 transition hover:bg-surface-2 dark:border-line" onClick={() => onOpen(a._id)}>
              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={selected.includes(a._id)} onChange={() => setSelected(selected.includes(a._id) ? selected.filter((x) => x !== a._id) : [...selected, a._id])} className="h-4 w-4 accent-pink" aria-label="Select" />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <SmartImage src={a.profile.headshot} alt="" className="h-10 w-10 shrink-0 rounded-xl border-2 border-ink" />
                  <div><p className="font-semibold">{a.profile.stageName || a.artist.name}</p><p className="text-xs text-muted">{[ageOf(a.profile) && `${ageOf(a.profile)}y`, a.profile.gender, a.profile.city].filter(Boolean).join(' · ')}</p></div>
                </div>
              </td>
              <td className="p-4"><MatchBadge score={a.matchScore} /></td>
              <td className="p-4"><Stars value={a.rating ?? 0} size={13} /></td>
              <td className="p-4"><StatusPill status={a.status} /></td>
              <td className="p-4">{a.selfTapeUrl ? <FileVideo className="h-4 w-4 text-pink" /> : <span className="text-muted">—</span>}</td>
              <td className="p-4 text-muted">{formatDate(a.createdAt)}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Suggestions({ castingId }: { castingId: string }) {
  const { data, isLoading } = useSWR<{ items: { profile: ArtistProfile; match: Match }[] }>(`/castings/${castingId}/suggestions`);
  const [boardFor, setBoardFor] = useState<ArtistProfile | null>(null);

  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-3xl" />)}</div>;
  if (!data?.items.length) return <EmptyState icon={<Wand2 />} title="No strong matches yet" description="As more artists complete their profiles, Smart Match will surface them here." />;

  return (
    <>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-ink bg-violet p-4 text-white shadow-brutal-sm">
        <Sparkles className="h-5 w-5 shrink-0" />
        <p className="text-sm"><b>{data.items.length} artists</b> fit this brief but haven’t applied. Ranked by gender, age, height, languages, skills & location.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.items.map(({ profile, match }) => (
          <TalentTile
            key={profile._id}
            profile={profile}
            footer={
              <div className="space-y-2">
                <MatchBadge score={match.score} />
                {match.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">{match.reasons.slice(0, 3).map((r) => <span key={r} className="rounded-full bg-lime/25 px-2 py-0.5 text-[10px] font-semibold text-green-800 dark:text-lime">✓ {r}</span>)}</div>
                )}
                {match.gaps.length > 0 && <p className="line-clamp-1 text-[10px] text-muted">Gap: {match.gaps[0]}</p>}
              </div>
            }
            actions={<Button size="sm" variant="outline" className="w-full" onClick={() => setBoardFor(profile)}><BookmarkPlus className="h-4 w-4" />Shortlist</Button>}
          />
        ))}
      </div>
      <AddToBoardModal open={Boolean(boardFor)} onClose={() => setBoardFor(null)} profileId={boardFor?._id ?? null} artistName={boardFor?.stageName} />
    </>
  );
}
