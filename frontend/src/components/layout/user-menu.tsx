'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/misc';
import { homeFor, useAuth } from '@/hooks/use-auth';

export function UserMenu() {
  const { user, profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;
  const home = homeFor(user.role);
  const items = [
    { href: home, label: 'Dashboard', icon: LayoutDashboard },
    ...(user.role === 'artist'
      ? [
          { href: '/dashboard/profile', label: 'Edit profile', icon: UserRound },
          ...(profile?.slug ? [{ href: `/artists/${profile.slug}`, label: 'View comp card', icon: ExternalLink }] : []),
        ]
      : []),
    { href: `${home}/settings`, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-0.5 transition hover:bg-surface-2" aria-label="Account menu">
        <Avatar src={profile?.headshot || user.avatar} name={user.name} size={38} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card absolute right-0 z-50 mt-3 w-60 overflow-hidden p-1.5">
            <div className="px-3 py-2.5">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              <span className="mt-1.5 inline-block rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{user.role}</span>
            </div>
            <div className="my-1 h-px bg-line/10 dark:bg-line" />
            {items.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-surface-2">
                <Icon className="h-4 w-4 text-muted" /> {label}
              </Link>
            ))}
            <button
              onClick={async () => { await logout(); router.push('/'); router.refresh(); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
