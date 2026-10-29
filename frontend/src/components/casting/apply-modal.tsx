'use client';

import { CheckCircle2, Sparkles, TriangleAlert, Video } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { DriveHelp, DriveVideo } from '@/components/media/drive-video';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ProgressRing } from '@/components/ui/misc';
import { useAuth } from '@/hooks/use-auth';
import { api, errorMessage } from '@/lib/api';
import { isDriveLink } from '@/lib/drive';
import type { CastingCall } from '@/types';

const MIN_COMPLETENESS = 40;

export function ApplyModal({ casting, open, onClose, onApplied }: { casting: CastingCall; open: boolean; onClose: () => void; onApplied: () => void }) {
  const { profile, refresh } = useAuth();
  const [coverNote, setCoverNote] = useState('');
  const [selfTapeUrl, setSelfTapeUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [showTape, setShowTape] = useState(casting.selfTapeRequired);

  const completeness = profile?.completeness ?? 0;
  const tapeInvalid = selfTapeUrl.length > 0 && !isDriveLink(selfTapeUrl);
  const tapeMissing = casting.selfTapeRequired && !selfTapeUrl;
  const blocked = completeness < MIN_COMPLETENESS;

  const submit = async () => {
    setBusy(true);
    try {
      await api.post(`/castings/${casting._id}/apply`, { coverNote, selfTapeUrl: selfTapeUrl || undefined });
      setDone(true);
      onApplied();
      refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => setDone(false), 300);
  };

  if (done) {
    return (
      <Modal open={open} onClose={close} size="sm">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-lime text-ink shadow-brutal"><CheckCircle2 className="h-10 w-10" /></div>
          <h3 className="text-2xl font-extrabold">You’re in the room! 🎬</h3>
          <p className="mt-2 text-sm text-muted">We’ll notify you the moment the casting team shortlists you. Track it under <b>Applied</b> in your dashboard.</p>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={close}>Keep browsing</Button>
            <ButtonLink href="/dashboard?tab=applied">Go to dashboard</ButtonLink>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={<>Apply for <span className="text-pink">{casting.roleName}</span></>}
      description={`${casting.projectName} · ${casting.projectType}`}
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={blocked || tapeMissing || tapeInvalid}>Send application</Button>
        </>
      }
    >
      <div className="space-y-5">
        {casting.match && (
          <div className="flex items-center gap-4 rounded-2xl border-2 border-ink/10 bg-surface-2/60 p-4 dark:border-line">
            <ProgressRing value={casting.match.score} size={72} stroke={8} />
            <div className="min-w-0 text-sm">
              <p className="mb-1 flex items-center gap-1 font-bold"><Sparkles className="h-4 w-4 text-pink" /> Smart Match</p>
              {casting.match.reasons.slice(0, 3).map((r) => <p key={r} className="text-fg/80">✓ {r}</p>)}
              {casting.match.gaps.slice(0, 2).map((g) => <p key={g} className="text-muted">✗ {g}</p>)}
            </div>
          </div>
        )}

        {blocked && (
          <div className="flex gap-3 rounded-2xl border-2 border-tangerine bg-tangerine/10 p-4 text-sm">
            <TriangleAlert className="h-5 w-5 shrink-0 text-tangerine" />
            <p>
              Your profile is <b>{completeness}%</b> complete. Casting teams need at least {MIN_COMPLETENESS}% to consider you.{' '}
              <Link href="/dashboard/profile" className="font-bold text-pink underline">Finish your profile →</Link>
            </p>
          </div>
        )}

        <Field label="Note to the casting team" hint={`${coverNote.length}/1000 · Why are you right for this role?`}>
          {(id) => <Textarea id={id} value={coverNote} maxLength={1000} onChange={(e) => setCoverNote(e.target.value)} placeholder="I grew up in a small town just like Saanvi’s…" />}
        </Field>

        {showTape ? (
          <div className="space-y-3">
            <Field label="Self-tape (Google Drive link)" required={casting.selfTapeRequired} error={tapeInvalid ? 'That doesn’t look like a Google Drive file link' : undefined} hint={<DriveHelp />}>
              {(id) => <Input id={id} value={selfTapeUrl} onChange={(e) => setSelfTapeUrl(e.target.value.trim())} placeholder="https://drive.google.com/file/d/…/view?usp=sharing" />}
            </Field>
            {casting.selfTapeInstructions && (
              <div className="rounded-2xl border-2 border-dashed border-violet/40 bg-violet/5 p-4 text-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-violet">Tape brief</p>
                <p className="whitespace-pre-line text-fg/80">{casting.selfTapeInstructions}</p>
              </div>
            )}
            {selfTapeUrl && !tapeInvalid && <DriveVideo url={selfTapeUrl} title="Your self-tape" />}
          </div>
        ) : (
          <button type="button" onClick={() => setShowTape(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:underline">
            <Video className="h-4 w-4" /> Attach an optional self-tape
          </button>
        )}
      </div>
    </Modal>
  );
}
