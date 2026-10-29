'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellRing, CalendarClock, CheckCheck, Inbox, Megaphone, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { cn, timeAgo } from '@/lib/utils';
import type { Notification } from '@/types';

const ICONS = { application: Inbox, status: Sparkles, audition: CalendarClock, casting: Megaphone, system: BellRing };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, mutate } = useSWR<{ items: Notification[]; unread: number }>('/notifications', { refreshInterval: 45_000 });

  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    mutate();
  };
  const markOne = (n: Notification) => {
    setOpen(false);
    if (!n.read) api.patch(`/notifications/${n._id}/read`).then(() => mutate());
  };

  const unread = data?.unread ?? 0;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-surface transition hover:bg-sun hover:text-ink dark:border-line" aria-label="Notifications">
        <Bell className={cn('h-[18px] w-[18px]', unread && 'origin-top animate-[wiggle_1s_ease-in-out_2]')} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-pink px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="card absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b-2 border-ink/10 px-4 py-3 dark:border-line">
              <p className="font-display font-bold">Notifications</p>
              {unread > 0 && (
                <button onClick={markAll} className="inline-flex items-center gap-1 text-xs font-semibold text-pink hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {!data?.items.length ? (
                <p className="px-4 py-10 text-center text-sm text-muted">You’re all caught up ✨</p>
              ) : (
                data.items.map((n) => {
                  const Icon = ICONS[n.type] ?? BellRing;
                  const body = (
                    <div className={cn('flex gap-3 px-4 py-3 transition hover:bg-surface-2', !n.read && 'bg-lime/10')}>
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-sun text-ink"><Icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug">{n.title}</p>
                        {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>}
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-pink" />}
                    </div>
                  );
                  return n.link ? (
                    <Link key={n._id} href={n.link} onClick={() => markOne(n)}>{body}</Link>
                  ) : (
                    <button key={n._id} className="block w-full text-left" onClick={() => markOne(n)}>{body}</button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
