'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clapperboard, Eye, Inbox, Lock, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2, Unlock, Users, Zap } from 'lucide-react';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { CastingStatusPill, Deadline } from '@/components/agency/shared';
import { PageHeader } from '@/components/layout/app-shell';
import { SmartImage } from '@/components/media/smart-image';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, Pagination, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { api, errorMessage, toQuery } from '@/lib/api';
import { ageRange, cn } from '@/lib/utils';
import type { CastingCall, Paginated } from '@/types';

type Scope = 'open' | 'draft' | 'closed' | 'all';

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'open', label: 'Live' },
  { value: 'draft', label: 'Drafts' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
];

export default function AgencyCastingsPage() {
  const [scope, setScope] = useState<Scope>('open');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<CastingCall | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounced = useDebounce(q);

  const key = `/castings${toQuery({ scope, q: debounced, page, limit: 12, sort: 'recent' })}`;
  const { data, isLoading, mutate } = useSWR<Paginated<CastingCall>>(key, { keepPreviousData: true });

  // After a delete/close empties the last page, step back instead of stranding the user on an empty page.
  useEffect(() => {
    if (data && !data.items.length && page > 1) setPage(Math.max(1, Math.min(page - 1, data.pages)));
  }, [data, page]);

  const setStatus = async (c: CastingCall, status: 'open' | 'closed' | 'draft') => {
    try {
      await api.patch(`/castings/${c._id}/status`, { status });
      toast.success(status === 'open' ? 'Casting is live 🎬' : status === 'closed' ? 'Casting closed' : 'Moved to drafts');
      mutate();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.del(`/castings/${toDelete._id}`);
      toast.success('Casting deleted');
      setToDelete(null);
      mutate();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Casting calls"
        title="Your castings"
        description="Post briefs, track applicants and close roles when you’ve found your cast."
        actions={<ButtonLink href="/agency/castings/new"><Plus className="h-4 w-4" />New casting</ButtonLink>}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={SCOPES} value={scope} onChange={(v) => { setScope(v); setPage(1); }} />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search role, project…" className="h-11 pl-10" />
        </div>
      </div>

      {isLoading && !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-80 rounded-3xl" />)}</div>
      ) : !data?.items.length ? (
        <EmptyState
          icon={<Clapperboard />}
          title={scope === 'draft' ? 'No drafts' : scope === 'closed' ? 'Nothing closed yet' : 'No castings here'}
          description="Create a casting call and matching artists get notified instantly."
          action={<ButtonLink href="/agency/castings/new" size="sm"><Plus className="h-4 w-4" />New casting</ButtonLink>}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted"><b className="text-fg">{data.total}</b> casting{data.total === 1 ? '' : 's'}</p>
          <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.items.map((c, i) => (
                <CastingAdminCard key={c._id} casting={c} index={i} onStatus={setStatus} onDelete={() => setToDelete(c)} />
              ))}
            </AnimatePresence>
          </motion.div>
          <div className="mt-8"><Pagination page={data.page} pages={data.pages} onChange={setPage} /></div>
        </>
      )}

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete this casting?"
        description={toDelete ? `“${toDelete.title}” and all ${toDelete.applicationsCount} applications will be permanently removed.` : undefined}
        size="sm"
        footer={<><Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button><Button variant="danger" loading={deleting} onClick={remove}><Trash2 className="h-4 w-4" />Delete</Button></>}
      >
        <p className="text-sm text-muted">Tip: closing a casting keeps the applicant history. Delete only if it was posted by mistake.</p>
      </Modal>
    </div>
  );
}

function CastingAdminCard({ casting: c, index, onStatus, onDelete }: {
  casting: CastingCall; index: number; onStatus: (c: CastingCall, s: 'open' | 'closed' | 'draft') => void; onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }} exit={{ opacity: 0, scale: 0.95 }} className="card card-hover flex flex-col overflow-hidden">
      <div className="relative">
        <SmartImage src={c.coverImage} alt={c.projectName} className="h-36" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <CastingStatusPill status={c.status} accepting={c.isAccepting} />
          {c.isUrgent && <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-pink px-2 py-0.5 text-[11px] font-bold uppercase text-white"><Zap className="h-3 w-3" />Urgent</span>}
        </div>
        <div className="absolute right-3 top-3">
          <button onClick={() => setMenu((m) => !m)} onBlur={() => setTimeout(() => setMenu(false), 150)} className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-surface" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="card absolute right-0 z-20 mt-2 w-44 p-1">
                {c.status !== 'open' && <MenuItem icon={Unlock} label="Publish / reopen" onClick={() => onStatus(c, 'open')} />}
                {c.status === 'open' && <MenuItem icon={Lock} label="Close casting" onClick={() => onStatus(c, 'closed')} />}
                {c.status !== 'draft' && <MenuItem icon={Pencil} label="Move to drafts" onClick={() => onStatus(c, 'draft')} />}
                <MenuItem icon={Trash2} label="Delete" danger onClick={onDelete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="absolute bottom-3 left-3 right-3 truncate text-xs font-bold uppercase tracking-wider text-white/80">{c.projectType} · {c.projectName}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug">{c.roleName} <span className="font-normal text-muted">— {c.title}</span></h3>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span>{c.gender === 'Any' ? 'Any gender' : c.gender}</span>
          <span>{ageRange(c.ageMin, c.ageMax)}</span>
          {c.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-3 text-center">
          <div><p className="font-display text-xl font-extrabold tabular-nums">{c.applicationsCount}</p><p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted"><Users className="h-3 w-3" />Applied</p></div>
          <div><p className="font-display text-xl font-extrabold tabular-nums">{c.views}</p><p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted"><Eye className="h-3 w-3" />Views</p></div>
          <div className="flex flex-col items-center justify-center"><Deadline date={c.deadline} /></div>
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <ButtonLink href={`/agency/castings/${c._id}`} size="sm" className="flex-1"><Inbox className="h-4 w-4" />Pipeline</ButtonLink>
          <ButtonLink href={`/agency/castings/${c._id}/edit`} size="sm" variant="outline"><Pencil className="h-4 w-4" />Edit</ButtonLink>
        </div>
      </div>
    </motion.article>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={cn('flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition', danger ? 'text-danger hover:bg-danger/10' : 'hover:bg-surface-2')}>
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

