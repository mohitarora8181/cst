'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, CalendarClock, CheckCircle2, Clock, ExternalLink, Mail, MapPin, MessageSquare, Phone, RefreshCw, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DriveVideo } from '@/components/media/drive-video';
import { SmartImage } from '@/components/media/smart-image';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { Stars } from '@/components/ui/misc';
import { api, errorMessage } from '@/lib/api';
import { cn, formatDate, formatDateTime, heightLabel, PIPELINE, STATUS_META } from '@/lib/utils';
import type { Application, ApplicationStatus, ArtistProfile, User } from '@/types';
import { MatchBadge, StatusPill } from './shared';

export type PopulatedApplication = Omit<Application, 'profile' | 'artist'> & {
  profile: ArtistProfile;
  artist: Pick<User, '_id' | 'name' | 'email'>;
};

export const ageOf = (p?: Pick<ArtistProfile, 'age' | 'dob'> | null) => {
  if (!p) return null;
  if (p.age != null) return p.age;
  if (!p.dob) return null;
  const d = new Date(p.dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a -= 1;
  return a;
};

const RESPONSE_META = {
  pending: { label: 'Awaiting artist response', className: 'bg-sun/25 text-amber-700 dark:text-sun', icon: Clock },
  confirmed: { label: 'Artist confirmed', className: 'bg-lime/30 text-green-800 dark:text-lime', icon: CheckCircle2 },
  reschedule: { label: 'Reschedule requested', className: 'bg-pink/15 text-pink', icon: RefreshCw },
} as const;

const toLocalInput = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function ApplicantDrawer({ app, onClose, onChanged }: { app: PopulatedApplication | null; onClose: () => void; onChanged: () => void }) {
  useEffect(() => {
    if (!app) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [app, onClose]);

  return (
    <AnimatePresence>
      {app && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-xl flex-col border-l-2 border-ink bg-surface dark:border-line"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}
            role="dialog"
            aria-modal="true"
          >
            <DrawerBody key={app._id} app={app} onClose={onClose} onChanged={onChanged} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerBody({ app, onClose, onChanged }: { app: PopulatedApplication; onClose: () => void; onChanged: () => void }) {
  const p = app.profile;
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [rating, setRating] = useState(app.rating ?? 0);
  const [notes, setNotes] = useState(app.agencyNotes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [aud, setAud] = useState({
    scheduledAt: toLocalInput(app.audition?.scheduledAt),
    mode: app.audition?.mode ?? 'online',
    location: app.audition?.location ?? '',
    notes: app.audition?.notes ?? '',
  });
  const [scheduling, setScheduling] = useState(false);
  const [showAudForm, setShowAudForm] = useState(!app.audition?.scheduledAt);

  const patch = async (body: Partial<{ status: ApplicationStatus; rating: number; agencyNotes: string }>, success?: string) => {
    await api.patch(`/applications/${app._id}`, body);
    if (success) toast.success(success);
    onChanged();
  };

  const changeStatus = async (s: ApplicationStatus) => {
    const prev = status;
    setStatus(s);
    try {
      await patch({ status: s }, `Moved to ${STATUS_META[s].label}`);
    } catch (err) {
      setStatus(prev);
      toast.error(errorMessage(err));
    }
  };

  const changeRating = async (r: number) => {
    setRating(r);
    try { await patch({ rating: r }); } catch (err) { toast.error(errorMessage(err)); }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try { await patch({ agencyNotes: notes }, 'Notes saved'); } catch (err) { toast.error(errorMessage(err)); } finally { setSavingNotes(false); }
  };

  const schedule = async () => {
    if (!aud.scheduledAt) return toast.error('Pick a date & time');
    setScheduling(true);
    try {
      await api.post(`/applications/${app._id}/audition`, { ...aud, scheduledAt: new Date(aud.scheduledAt).toISOString() });
      toast.success('Audition scheduled — artist notified');
      setStatus('audition');
      setShowAudForm(false);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setScheduling(false);
    }
  };

  const age = ageOf(p);
  const response = app.audition?.response ? RESPONSE_META[app.audition.response] : null;
  const whatsapp = (p.whatsapp || p.phone || '').replace(/[^\d]/g, '');

  return (
    <>
      <div className="relative h-56 shrink-0">
        <SmartImage src={p.headshot} alt={p.stageName || 'Artist'} className="h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <button onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-surface" aria-label="Close"><X className="h-5 w-5" /></button>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <div className="mb-2 flex flex-wrap gap-2"><MatchBadge score={app.matchScore} /><StatusPill status={status} className="bg-white/90" /></div>
          <h2 className="flex items-center gap-2 text-3xl font-extrabold">{p.stageName || app.artist.name}{p.isVerified && <BadgeCheck className="h-6 w-6 fill-sky text-ink" />}</h2>
          <p className="flex flex-wrap gap-x-3 text-sm text-white/80">
            {[age && `${age} yrs`, p.gender, heightLabel(p.heightCm) !== '—' && heightLabel(p.heightCm)].filter(Boolean).join(' · ')}
            {p.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.city}</span>}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Link href={`/agency/talent/${p._id}`} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-surface px-3 py-1.5 text-xs font-bold transition hover:bg-lime hover:text-ink dark:border-line"><ExternalLink className="h-3.5 w-3.5" />Full profile</Link>
          <a href={`mailto:${app.artist.email}`} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-surface px-3 py-1.5 text-xs font-bold transition hover:bg-sun hover:text-ink dark:border-line"><Mail className="h-3.5 w-3.5" />Email</a>
          {p.phone && <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-surface px-3 py-1.5 text-xs font-bold transition hover:bg-sky hover:text-ink dark:border-line"><Phone className="h-3.5 w-3.5" />{p.phone}</a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-success px-3 py-1.5 text-xs font-bold text-white"><MessageSquare className="h-3.5 w-3.5" />WhatsApp</a>}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Move to stage</p>
          <div className="flex flex-wrap gap-2">
            {PIPELINE.map((s) => (
              <button key={s} onClick={() => s !== status && changeStatus(s)} className={cn('inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition', s === status ? 'border-ink bg-lime text-ink shadow-brutal-sm' : 'border-line/20 text-muted hover:border-fg/40 hover:text-fg dark:border-line')}>
                <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />{STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border-2 border-ink/10 bg-surface-2/60 p-4 dark:border-line">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Your rating (private)</p>
            <Stars value={rating} onChange={changeRating} size={20} />
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Private notes — only your team sees these…" />
          <div className="mt-2 flex justify-end"><Button size="sm" variant="outline" onClick={saveNotes} loading={savingNotes} disabled={notes === (app.agencyNotes ?? '')}><Save className="h-3.5 w-3.5" />Save notes</Button></div>
        </div>

        <div className="rounded-3xl border-2 border-ink p-4 dark:border-line">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold"><CalendarClock className="h-4 w-4 text-pink" />Audition</p>
            {app.audition?.scheduledAt && !showAudForm && <button onClick={() => setShowAudForm(true)} className="text-xs font-semibold text-pink hover:underline">Reschedule</button>}
          </div>
          {app.audition?.scheduledAt && !showAudForm && (
            <div className="space-y-2 text-sm">
              <p className="font-display text-xl font-bold">{formatDateTime(app.audition.scheduledAt)}</p>
              <p className="text-muted"><b className="capitalize text-fg">{app.audition.mode}</b> · {app.audition.location}</p>
              {app.audition.notes && <p className="text-muted">{app.audition.notes}</p>}
              {response && (
                <p className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', response.className)}>
                  <response.icon className="h-3.5 w-3.5" />{response.label}{app.audition.responseNote && ` — “${app.audition.responseNote}”`}
                </p>
              )}
            </div>
          )}
          {showAudForm && (
            <div className="space-y-3">
              {['selected', 'rejected'].includes(status) && <p className="text-xs text-danger">This application is already {status}; move it back to schedule an audition.</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Date & time">{(id) => <Input id={id} type="datetime-local" value={aud.scheduledAt} onChange={(e) => setAud({ ...aud, scheduledAt: e.target.value })} />}</Field>
                <Field label="Mode">{(id) => <Select id={id} value={aud.mode} onChange={(e) => setAud({ ...aud, mode: e.target.value as 'online' | 'in-person' })} options={[{ value: 'online', label: 'Online' }, { value: 'in-person', label: 'In person' }]} placeholder="Mode" />}</Field>
              </div>
              <Field label={aud.mode === 'online' ? 'Meeting link' : 'Address'}>{(id) => <Input id={id} value={aud.location} onChange={(e) => setAud({ ...aud, location: e.target.value })} placeholder={aud.mode === 'online' ? 'https://meet.google.com/…' : 'Studio 4, Film City, Mumbai'} />}</Field>
              <Field label="Notes for the artist">{(id) => <Textarea id={id} rows={2} value={aud.notes} onChange={(e) => setAud({ ...aud, notes: e.target.value })} placeholder="Wear plain clothes, carry printed sides…" />}</Field>
              <div className="flex justify-end gap-2">
                {app.audition?.scheduledAt && <Button size="sm" variant="ghost" onClick={() => setShowAudForm(false)}>Cancel</Button>}
                <Button size="sm" variant="pink" onClick={schedule} loading={scheduling}>Send invite</Button>
              </div>
            </div>
          )}
        </div>

        {app.coverNote && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Cover note</p>
            <blockquote className="rounded-2xl border-l-4 border-pink bg-surface-2 p-4 text-sm leading-relaxed">“{app.coverNote}”</blockquote>
          </div>
        )}

        {app.selfTapeUrl && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Self-tape</p>
            <DriveVideo url={app.selfTapeUrl} title="Self-tape for this role" />
          </div>
        )}

        {p.videos?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Profile videos</p>
            <div className="grid gap-3 sm:grid-cols-2">{p.videos.map((v) => <DriveVideo key={v._id ?? v.url} url={v.url} title={v.title} />)}</div>
          </div>
        )}

        {(p.languages?.length > 0 || p.skills?.length > 0) && (
          <div className="space-y-3">
            {p.languages?.length > 0 && <TagRow label="Languages" items={p.languages} />}
            {p.skills?.length > 0 && <TagRow label="Skills" items={p.skills} />}
          </div>
        )}

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Timeline</p>
          <ol className="relative space-y-3 border-l-2 border-dashed border-line/30 pl-5 dark:border-line">
            {app.history.map((h, i) => (
              <li key={i} className="relative">
                <span className={cn('absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-ink', STATUS_META[h.status]?.dot)} />
                <p className="text-sm font-semibold">{STATUS_META[h.status]?.label ?? h.status}</p>
                <p className="text-xs text-muted">{formatDate(h.at, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

function TagRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">{items.map((s) => <span key={s} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold">{s}</span>)}</div>
    </div>
  );
}
