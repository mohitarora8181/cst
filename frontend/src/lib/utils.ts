import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApplicationStatus } from '@/types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function formatDate(d?: string | Date | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', opts);
}

export function formatDateTime(d?: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function timeLeft(deadline: string | Date) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { label: 'Closed', urgent: false, closed: true };
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days >= 1) return { label: `${days}d ${hours}h left`, urgent: days < 3, closed: false };
  return { label: `${hours}h left`, urgent: true, closed: false };
}

export function timeAgo(d: string | Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  const units: [number, string][] = [[31_536_000, 'y'], [2_592_000, 'mo'], [86_400, 'd'], [3_600, 'h'], [60, 'm']];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return 'just now';
}

export const ageRange = (min?: number | null, max?: number | null) =>
  min == null && max == null ? 'Any age' : `${min ?? 0}–${max ?? '∞'} yrs`;

export const heightLabel = (cm?: number | null) => {
  if (!cm) return '—';
  const inches = Math.round(cm / 2.54);
  return `${cm} cm · ${Math.floor(inches / 12)}'${inches % 12}"`;
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export const STATUS_META: Record<ApplicationStatus, { label: string; className: string; dot: string }> = {
  applied: { label: 'Applied', className: 'bg-sky/15 text-cyan-700 dark:text-sky border-sky/40', dot: 'bg-sky' },
  shortlisted: { label: 'Shortlisted', className: 'bg-violet/15 text-violet border-violet/40', dot: 'bg-violet' },
  audition: { label: 'Audition', className: 'bg-sun/25 text-amber-700 dark:text-sun border-sun/50', dot: 'bg-sun' },
  selected: { label: 'Selected', className: 'bg-lime/30 text-green-800 dark:text-lime border-lime/60', dot: 'bg-lime' },
  rejected: { label: 'Not selected', className: 'bg-danger/10 text-danger border-danger/30', dot: 'bg-danger' },
};

export const PIPELINE: ApplicationStatus[] = ['applied', 'shortlisted', 'audition', 'selected', 'rejected'];

export const matchTone = (score: number) =>
  score >= 80 ? 'bg-lime text-ink' : score >= 60 ? 'bg-sun text-ink' : score >= 40 ? 'bg-tangerine text-ink' : 'bg-surface-2 text-muted';
