'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/misc';
import { homeFor, useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export interface NavItem { href: string; label: string; icon: LucideIcon; exact?: boolean }

interface AppShellProps {
  role: Role;
  nav: NavItem[];
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Authenticated area chrome: role guard + sidebar + top bar. */
export function AppShell({ role, nav, footer, children }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== role) router.replace(homeFor(user.role));
  }, [user, isLoading, role, router, pathname]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (isLoading || !user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted"><Spinner className="h-8 w-8 text-pink" /><span className="text-sm">Loading your studio…</span></div>
      </div>
    );
  }

  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo href="/" />
      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href} className={cn('relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition', active ? 'text-ink' : 'text-muted hover:bg-surface-2 hover:text-fg')}>
              {active && <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-2xl border-2 border-ink bg-lime shadow-brutal-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              <item.icon className="relative z-10 h-[18px] w-[18px]" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {footer}
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r-2 border-ink/10 bg-surface/60 lg:block dark:border-line">{sidebar}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 border-r-2 border-ink bg-surface lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}>
              <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 rounded-lg p-1.5 hover:bg-surface-2" aria-label="Close menu"><X className="h-5 w-5" /></button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b-2 border-ink/10 bg-bg/80 px-4 backdrop-blur-xl sm:px-6 dark:border-line">
          <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-surface lg:hidden dark:border-line" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <p className="hidden text-sm text-muted lg:block">
            Hey <span className="font-semibold text-fg">{user.name.split(' ')[0]}</span> 👋 {role === 'agency' ? 'Let’s find your next star.' : 'Your next role is out there.'}
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <motion.main key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-pink">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
