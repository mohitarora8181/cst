'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clapperboard, Copy, Pencil, Trash2, UserMinus, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { BoardFormModal } from '@/components/agency/board-form-modal';
import { TalentTile } from '@/components/agency/shared';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { api, errorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Board } from '@/types';

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, mutate } = useSWR<{ board: Board }>(`/boards/${id}`);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (error) return <EmptyState title="Board not found" description={error.message} action={<ButtonLink href="/agency/boards" size="sm" variant="outline">All boards</ButtonLink>} />;
  if (!data) return <Skeleton className="h-[60vh] rounded-3xl" />;
  const { board } = data;

  const remove = async (profileId: string, name?: string) => {
    mutate({ board: { ...board, items: board.items.filter((i) => i.profile._id !== profileId) } }, { revalidate: false });
    try {
      await api.del(`/boards/${board._id}/items/${profileId}`);
      toast.success(`${name || 'Artist'} removed`);
    } catch (err) {
      toast.error(errorMessage(err));
      mutate();
    }
  };

  const destroy = async () => {
    setDeleting(true);
    try {
      await api.del(`/boards/${board._id}`);
      toast.success('Board deleted');
      router.push('/agency/boards');
    } catch (err) {
      toast.error(errorMessage(err));
      setDeleting(false);
    }
  };

  const copyLinks = async () => {
    const text = board.items.map((i) => `${i.profile.stageName} — ${window.location.origin}/artists/${i.profile.slug}`).join('\n');
    try { await navigator.clipboard.writeText(`${board.name}\n\n${text}`); toast.success('Comp card links copied — paste them to your client'); } catch { toast.error('Could not copy'); }
  };

  return (
    <div>
      <Link href="/agency/boards" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All boards</Link>

      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card relative mb-8 overflow-hidden p-6 sm:p-8" style={{ background: board.color }}>
        <div className="absolute inset-0 opacity-20 dotted-bg" />
        <div className="relative flex flex-col gap-4 text-ink sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Shortlist board</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{board.name}</h1>
            {board.description && <p className="mt-2 max-w-2xl text-ink/75">{board.description}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{board.items.length} artists</span>
              {board.castingCall && <Link href={`/agency/castings/${board.castingCall._id}`} className="inline-flex items-center gap-1 underline"><Clapperboard className="h-4 w-4" />{board.castingCall.roleName} · {board.castingCall.projectName}</Link>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={copyLinks} disabled={!board.items.length}><Copy className="h-4 w-4" />Share links</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Edit</Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </motion.header>

      {!board.items.length ? (
        <EmptyState icon={<Users />} title="This board is empty" description="Shortlist artists from talent search or a casting’s smart suggestions." action={<ButtonLink href="/agency/talent" size="sm">Search talent</ButtonLink>} />
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {board.items.filter((i) => i.profile).map((item) => (
              <TalentTile
                key={item.profile._id}
                profile={item.profile}
                footer={<p className="text-[10px] uppercase tracking-wider text-muted">Added {formatDate(item.addedAt)}</p>}
                actions={<Button size="sm" variant="ghost" className="w-full text-danger" onClick={() => remove(item.profile._id, item.profile.stageName)}><UserMinus className="h-4 w-4" />Remove</Button>}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <BoardFormModal open={editing} onClose={() => setEditing(false)} board={board} onSaved={() => mutate()} />
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete board?" description="Artists stay in your talent pool — only this shortlist is removed." size="sm"
        footer={<><Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="danger" loading={deleting} onClick={destroy}>Delete board</Button></>}>
        <p className="text-sm text-muted">“{board.name}” · {board.items.length} artists</p>
      </Modal>
    </div>
  );
}
