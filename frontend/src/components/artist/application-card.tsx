'use client';

import { CalendarClock, MapPin, Video, Wifi } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Deadline } from '@/components/casting/deadline';
import { StatusPill, StatusTracker } from '@/components/casting/status-pill';
import { SmartImage } from '@/components/media/smart-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, errorMessage } from '@/lib/api';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import type { Application, CastingCall } from '@/types';

/** One of the artist's applications, with progress tracker and audition RSVP. */
export function ApplicationCard({ application: app, onChange }: { application: Application; onChange: () => void }) {
  const call = app.castingCall as CastingCall;
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [askReschedule, setAskReschedule] = useState(false);
  const audition = app.audition?.scheduledAt ? app.audition : null;
  const upcoming = audition && new Date(audition.scheduledAt) > new Date();

  const respond = async (response: 'confirmed' | 'reschedule') => {
    setBusy(response);
    try {
      await api.post(`/applications/${app._id}/audition/respond`, { response, responseNote: note || undefined });
      toast.success(response === 'confirmed' ? 'Audition confirmed — break a leg! 🎭' : 'Reschedule request sent');
      setAskReschedule(false);
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const withdraw = async () => {
    if (!confirm('Withdraw this application? You can re-apply while the call is open.')) return;
    setBusy('withdraw');
    try {
      await api.del(`/applications/${app._id}`);
      toast.success('Application withdrawn');
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (!call || typeof call !== 'object') return null;

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Link href={`/castings/${call._id}`} className="relative block h-36 sm:h-auto sm:w-48 sm:shrink-0">
          <SmartImage src={call.coverImage} alt={call.projectName} className="h-full w-full" />
          <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-sun px-2 py-0.5 text-[10px] font-bold uppercase text-ink">{call.projectType}</span>
        </Link>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">{call.projectName}</p>
              <Link href={`/castings/${call._id}`} className="font-display text-xl font-bold hover:text-pink">{call.roleName}</Link>
              <p className="mt-0.5 text-xs text-muted">Applied {formatDate(app.createdAt)} · {app.matchScore}% match{app.selfTapeUrl && <> · <Video className="inline h-3 w-3" /> tape sent</>}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusPill status={app.status} />
              {call.isAccepting ? <Deadline date={call.deadline} /> : <span className="text-xs font-semibold text-muted">Call closed</span>}
            </div>
          </div>

          <StatusTracker status={app.status} />

          {audition && (
            <div className={cn('rounded-2xl border-2 p-4', upcoming ? 'border-ink bg-sun/20 dark:border-sun/50' : 'border-line/15 bg-surface-2/50')}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 font-bold"><CalendarClock className="h-4 w-4 text-pink" /> Audition · {formatDateTime(audition.scheduledAt)}</p>
                  <p className="flex items-center gap-2 text-fg/80">
                    {audition.mode === 'online' ? <Wifi className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    {/^https?:\/\//.test(audition.location) ? <a href={audition.location} target="_blank" rel="noreferrer" className="font-semibold text-violet underline">Join link</a> : audition.location}
                  </p>
                  {audition.notes && <p className="text-xs text-muted">“{audition.notes}”</p>}
                </div>
                {upcoming && audition.response === 'pending' && !askReschedule && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setAskReschedule(true)}>Reschedule</Button>
                    <Button size="sm" loading={busy === 'confirmed'} onClick={() => respond('confirmed')}>Confirm</Button>
                  </div>
                )}
                {audition.response !== 'pending' && (
                  <span className={cn('rounded-full px-3 py-1 text-xs font-bold', audition.response === 'confirmed' ? 'bg-lime text-ink' : 'bg-tangerine text-ink')}>
                    {audition.response === 'confirmed' ? '✓ Confirmed' : '↻ Reschedule requested'}
                  </span>
                )}
              </div>
              {askReschedule && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Suggest a time that works for you…" className="h-10" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setAskReschedule(false)}>Cancel</Button>
                    <Button size="sm" variant="pink" loading={busy === 'reschedule'} onClick={() => respond('reschedule')}>Send</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {app.status === 'applied' && call.isAccepting && (
            <div className="flex justify-end">
              <button onClick={withdraw} disabled={busy === 'withdraw'} className="text-xs font-semibold text-muted underline-offset-2 hover:text-danger hover:underline">Withdraw application</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
