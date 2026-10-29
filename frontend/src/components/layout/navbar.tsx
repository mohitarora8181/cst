'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { homeFor, useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

const LINKS = [
  { href: '/castings', label: 'Castings' },
  { href: '/#artists', label: 'Artists' },
  { href: '/#releases', label: 'Releases' },
  { href: '/#how', label: 'How it works' },
];

export function Navbar() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12));
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'container flex h-16 items-center justify-between gap-4 rounded-2xl border-2 transition-all duration-300',
          scrolled ? 'border-ink bg-surface/85 shadow-brutal backdrop-blur-xl dark:border-line' : 'border-transparent bg-transparent'
        )}
      >
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={cn('rounded-xl px-3.5 py-2 text-sm font-semibold transition hover:bg-surface-2', pathname === l.href ? 'text-pink' : 'text-fg/80 hover:text-fg')}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoading && (user ? (
            <>
              <NotificationBell />
              <ButtonLink href={homeFor(user.role)} size="sm" className="hidden sm:inline-flex">Dashboard</ButtonLink>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold hover:bg-surface-2 sm:block">Sign in</Link>
              <ButtonLink href="/register" size="sm" className="hidden sm:inline-flex">Join free</ButtonLink>
            </>
          ))}
          <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-surface md:hidden dark:border-line" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card container mt-2 p-3 md:hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-xl px-4 py-3 font-display text-lg font-bold hover:bg-surface-2">{l.label}</Link>
            ))}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ButtonLink href="/login" variant="outline">Sign in</ButtonLink>
                <ButtonLink href="/register">Join free</ButtonLink>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
