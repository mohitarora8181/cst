'use client';

import { Bookmark, Clapperboard, LayoutDashboard, Palette, Settings, Users } from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/app-shell';
import { ButtonLink } from '@/components/ui/button';

const NAV: NavItem[] = [
  { href: '/agency', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/agency/castings', label: 'Castings', icon: Clapperboard },
  { href: '/agency/talent', label: 'Talent', icon: Users },
  { href: '/agency/boards', label: 'Boards', icon: Bookmark },
  { href: '/agency/cms', label: 'Site CMS', icon: Palette },
  { href: '/agency/settings', label: 'Settings', icon: Settings },
];

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      role="agency"
      nav={NAV}
      footer={
        <div className="rounded-3xl border-2 border-ink bg-pink p-4 text-white shadow-brutal-sm">
          <p className="font-display text-lg font-bold leading-tight">New role to fill?</p>
          <p className="mt-1 text-xs text-white/80">Post a call — matching artists get alerted instantly.</p>
          <ButtonLink href="/agency/castings/new" size="sm" className="mt-3 w-full">Post casting</ButtonLink>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
