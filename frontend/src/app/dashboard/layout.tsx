'use client';

import { Clapperboard, LayoutDashboard, Settings, UserRound } from 'lucide-react';
import Link from 'next/link';
import { AppShell, type NavItem } from '@/components/layout/app-shell';
import { ProgressRing } from '@/components/ui/misc';
import { useAuth } from '@/hooks/use-auth';

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'My profile', icon: UserRound },
  { href: '/castings', label: 'Browse castings', icon: Clapperboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function ProfileMeter() {
  const { profile } = useAuth();
  if (!profile) return null;
  return (
    <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-sun/30 p-3 transition hover:bg-sun/50 dark:border-line">
      <ProgressRing value={profile.completeness} size={52} stroke={6} label={<span className="text-xs font-extrabold">{profile.completeness}%</span>} />
      <div className="min-w-0 text-xs">
        <p className="font-bold">Profile strength</p>
        <p className="text-muted">{profile.completeness >= 100 ? 'Casting-ready ✨' : 'Complete it to rank higher'}</p>
      </div>
    </Link>
  );
}

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="artist" nav={NAV} footer={<ProfileMeter />}>{children}</AppShell>;
}
