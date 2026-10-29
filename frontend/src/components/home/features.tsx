'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, CalendarClock, IdCard, Kanban, Sparkles, Video } from 'lucide-react';
import { useState } from 'react';
import { Stagger, staggerChild } from '@/components/motion/reveal';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Sparkles, title: 'Smart Match', body: 'Every casting shows how well you fit — age, look, languages, skills — and what’s missing. Agencies get ranked suggestions.', tone: 'bg-lime' },
  { icon: Video, title: 'Self-tapes via Drive', body: 'Share a Google Drive link, we embed it beautifully. No upload limits, no compression, no fuss.', tone: 'bg-pink' },
  { icon: CalendarClock, title: 'Audition scheduler', body: 'Agencies book slots (online or in-person); artists confirm or request a reschedule in one tap.', tone: 'bg-sun' },
  { icon: IdCard, title: 'Digital comp card', body: 'A gorgeous, shareable & printable portfolio page — headshots, measurements, reels and credits.', tone: 'bg-sky' },
  { icon: Kanban, title: 'Casting pipeline', body: 'Kanban from applied → selected, star ratings, private notes, bulk actions and one-click CSV export.', tone: 'bg-violet' },
  { icon: BadgeCheck, title: 'Verified & safe', body: 'Verified agencies and artists, smart alerts for matching roles, and zero fees to audition. Ever.', tone: 'bg-tangerine' },
];

const STEPS = {
  artist: [
    ['Build your comp card', 'Headshots, measurements, languages, skills and Drive showreels — your profile meter shows what’s left.'],
    ['Apply with one tap', 'Your Smart Match score tells you which roles to chase. Attach a self-tape when the brief asks.'],
    ['Track every callback', 'Open, Applied and Closed tabs + live status, audition invites and instant notifications.'],
  ],
  agency: [
    ['Post a casting brief', 'Role, playing age, look, languages, skills, self-tape brief and deadline — live in minutes.'],
    ['Search & get suggestions', 'Filter 15+ attributes or let Smart Match surface talent who haven’t applied yet.'],
    ['Shortlist, audition, select', 'Move talent through the pipeline, schedule auditions, build shortlist boards and export.'],
  ],
};

export function Features() {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <motion.div key={f.title} variants={staggerChild} whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }} className="card group p-7">
          <span className={cn('mb-5 grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink text-ink shadow-brutal-sm transition-transform group-hover:rotate-12', f.tone)}>
            <f.icon className="h-6 w-6" />
          </span>
          <h3 className="text-2xl font-bold">{f.title}</h3>
          <p className="mt-2 text-muted">{f.body}</p>
        </motion.div>
      ))}
    </Stagger>
  );
}

export function HowItWorks() {
  const [who, setWho] = useState<'artist' | 'agency'>('artist');
  return (
    <div>
      <Tabs value={who} onChange={setWho} items={[{ value: 'artist', label: 'For artists' }, { value: 'agency', label: 'For casting teams' }]} className="mb-10" />
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS[who].map(([title, body], i) => (
          <motion.div key={who + i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative">
            <span className="text-stroke font-display text-[7rem] font-extrabold leading-none opacity-60">0{i + 1}</span>
            <div className="-mt-8 rounded-3xl border-2 border-ink bg-surface p-6 dark:border-line">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
