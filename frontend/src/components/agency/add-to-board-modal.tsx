'use client';

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/misc';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Board } from '@/types';

export const BOARD_COLORS = ['#c6ff3d', '#ff4fa3', '#8b5cf6', '#ffd23f', '#22d3ee', '#ff7a1a'];

const profileIdOf = (item: Board['items'][number]) => (typeof item.profile === 'string' ? item.profile : item.profile?._id);

/** Toggle an artist on/off any of the agency's shortlist boards; create a new board inline. */
export function AddToBoardModal({ open, onClose, profileId, artistName, onChange }: {
  open: boolean; onClose: () => void; profileId: string | null; artistName?: string; onChange?: () => void;
}) {
  const { data, isLoading, mutate } = useSWR<{ items: Board[] }>(open ? '/boards' : null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const toggle = async (board: Board) => {
    if (!profileId) return;
    const has = board.items.some((i) => profileIdOf(i) === profileId);
    setBusy(board._id);
    try {
      if (has) await api.del(`/boards/${board._id}/items/${profileId}`);
      else await api.post(`/boards/${board._id}/items`, { profileId });
      toast.success(has ? `Removed from ${board.name}` : `Added to ${board.name}`);
      await mutate();
      onChange?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const create = async () => {
    if (name.trim().length < 2 || !profileId) return;
    setCreating(true);
    try {
      const { board } = await api.post<{ board: Board }>('/boards', { name: name.trim(), color: BOARD_COLORS[(data?.items.length ?? 0) % BOARD_COLORS.length] });
      await api.post(`/boards/${board._id}/items`, { profileId });
      toast.success(`Created “${board.name}” and added ${artistName || 'artist'}`);
      setName('');
      await mutate();
      onChange?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to shortlist board" description={artistName ? `Save ${artistName} to one or more boards.` : undefined} size="sm">
      <div className="space-y-2">
        {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}
        {data?.items.map((b) => {
          const has = b.items.some((i) => profileIdOf(i) === profileId);
          return (
            <button key={b._id} onClick={() => toggle(b)} disabled={busy === b._id} className={cn('flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition', has ? 'border-ink bg-lime/20' : 'border-line/20 hover:bg-surface-2 dark:border-line')}>
              <span className="h-8 w-8 shrink-0 rounded-lg border-2 border-ink" style={{ background: b.color }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{b.name}</span>
                <span className="text-xs text-muted">{b.items.length} artist{b.items.length === 1 ? '' : 's'}</span>
              </span>
              <span className={cn('grid h-6 w-6 place-items-center rounded-md border-2 border-ink', has ? 'bg-lime text-ink' : 'bg-surface')}>{has && <Check className="h-4 w-4" />}</span>
            </button>
          );
        })}
        {data && !data.items.length && <p className="py-2 text-center text-sm text-muted">No boards yet — create your first one below.</p>}
      </div>
      <div className="mt-5 flex gap-2 border-t-2 border-ink/10 pt-5 dark:border-line">
        <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} placeholder="New board name…" className="h-11" />
        <Button onClick={create} loading={creating} disabled={name.trim().length < 2}><Plus className="h-4 w-4" />Create</Button>
      </div>
    </Modal>
  );
}
