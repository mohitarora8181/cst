'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Clapperboard, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { BoardFormModal } from '@/components/agency/board-form-modal';
import { PageHeader } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Avatar, EmptyState, Skeleton } from '@/components/ui/misc';
import { timeAgo } from '@/lib/utils';
import type { Board } from '@/types';

export default function BoardsPage() {
  const { data, isLoading, mutate } = useSWR<{ items: Board[] }>('/boards');
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Shortlists"
        title="Boards"
        description="Your mood-boards of talent — for roles, look tests and client pitches."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New board</Button>}
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-3xl" />)}</div>
      ) : !data?.items.length ? (
        <EmptyState icon={<Bookmark />} title="No boards yet" description="Create a board, then shortlist artists from talent search or smart suggestions." action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Create board</Button>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {data.items.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 20, rotate: i % 2 ? 1.5 : -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.05, type: 'spring', bounce: 0.3 }}>
                <Link href={`/agency/boards/${b._id}`} className="card card-hover group block overflow-hidden">
                  <div className="relative h-28 border-b-2 border-ink dark:border-line" style={{ background: b.color }}>
                    <div className="absolute inset-0 opacity-20 dotted-bg" />
                    <div className="absolute -bottom-6 left-5 flex -space-x-3">
                      {b.items.slice(0, 5).map((it) => (
                        <Avatar key={it._id} src={it.profile?.headshot} name={it.profile?.stageName || '?'} size={52} className="transition-transform group-hover:-translate-y-1" />
                      ))}
                      {b.items.length > 5 && <span className="grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-ink bg-surface text-sm font-bold">+{b.items.length - 5}</span>}
                    </div>
                    <span className="absolute right-4 top-4 rounded-full border-2 border-ink bg-surface px-2.5 py-0.5 text-xs font-bold">{b.items.length} artists</span>
                  </div>
                  <div className="p-5 pt-9">
                    <h3 className="font-display text-lg font-bold">{b.name}</h3>
                    {b.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{b.description}</p>}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted">
                      {b.castingCall ? <span className="inline-flex items-center gap-1 truncate"><Clapperboard className="h-3.5 w-3.5" />{b.castingCall.roleName}</span> : <span />}
                      <span>Updated {timeAgo(b.updatedAt)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <BoardFormModal open={open} onClose={() => setOpen(false)} onSaved={() => mutate()} />
    </div>
  );
}
