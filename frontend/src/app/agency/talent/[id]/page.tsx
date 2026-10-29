'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, BadgeCheck, Bookmark, BookmarkPlus, ChevronLeft, ChevronRight, Crown, Eye, Film, Globe, Mail, MapPin, MessageSquare, Phone, Share2, X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { AddToBoardModal } from '@/components/agency/add-to-board-modal';
import { ageOf } from '@/components/agency/applicant-drawer';
import { AVAILABILITY_DOT, SectionCard, StatusPill } from '@/components/agency/shared';
import { DriveVideo } from '@/components/media/drive-video';
import { SmartImage } from '@/components/media/smart-image';
import { Button, buttonClass } from '@/components/ui/button';
import { EmptyState, ProgressRing, Skeleton } from '@/components/ui/misc';
import { Switch } from '@/components/ui/switch';
import { api, errorMessage } from '@/lib/api';
import { cn, formatDate, heightLabel, timeAgo } from '@/lib/utils';
import type { Application, ArtistProfile, Board, CastingCall, User } from '@/types';

interface TalentResponse {
  profile: Omit<ArtistProfile, 'user'> & { user: Pick<User, '_id' | 'name' | 'email' | 'avatar' | 'createdAt'> & { lastLoginAt?: string } };
  applications: (Omit<Application, 'castingCall'> & { castingCall: Pick<CastingCall, '_id' | 'title' | 'projectName' | 'roleName' | 'status' | 'deadline'> | null })[];
  boards: Pick<Board, '_id' | 'name' | 'color'>[];
}

export default function TalentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, mutate } = useSWR<TalentResponse>(`/talent/${id}`);
  const [boardOpen, setBoardOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (error) return <EmptyState title="Artist not found" description={error.message} action={<Link href="/agency/talent" className={buttonClass('outline', 'sm')}>Back to search</Link>} />;
  if (!data) return <div className="grid gap-6 lg:grid-cols-[360px_1fr]"><Skeleton className="h-[70vh] rounded-3xl" /><Skeleton className="h-[70vh] rounded-3xl" /></div>;

  const { profile: p, applications, boards } = data;
  const age = ageOf(p);
  const photos = p.photos ?? [];
  const whatsapp = (p.whatsapp || p.phone || '').replace(/[^\d]/g, '');

  const setFlag = async (key: 'isVerified' | 'isFeatured', value: boolean) => {
    mutate({ ...data, profile: { ...p, [key]: value } }, { revalidate: false });
    try {
      await api.patch(`/talent/${p._id}/flags`, { [key]: value });
      toast.success(key === 'isVerified' ? (value ? 'Artist verified ✔' : 'Verification removed') : value ? 'Featured on homepage ⭐' : 'Removed from homepage');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      mutate();
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/artists/${p.slug}`;
    try { await navigator.clipboard.writeText(url); toast.success('Comp card link copied'); } catch { toast.error(url); }
  };

  const attrs: [string, React.ReactNode][] = [
    ['Age', age ? `${age} yrs` : '—'],
    ['Gender', p.gender || '—'],
    ['Height', heightLabel(p.heightCm)],
    ['Weight', p.weightKg ? `${p.weightKg} kg` : '—'],
    ['Body type', p.bodyType || '—'],
    ['Skin tone', p.skinTone || '—'],
    ['Eyes', p.eyeColor || '—'],
    ['Hair', p.hairColor || '—'],
    ['Experience', p.experienceLevel || '—'],
    ['Travel', p.willingToTravel ? 'Willing to travel' : 'Local only'],
  ];

  return (
    <div>
      <Link href="/agency/talent" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />Talent search</Link>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            <div className="relative">
              <SmartImage src={p.headshot} alt={p.stageName || ''} className="aspect-[4/5]" />
              {p.isFeatured && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-sun px-2.5 py-0.5 text-[11px] font-bold uppercase text-ink"><Crown className="h-3 w-3" />Featured</span>}
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold">{p.stageName || p.user.name}{p.isVerified && <BadgeCheck className="h-6 w-6 fill-sky text-ink" />}</h1>
                {p.headline && <p className="text-sm text-muted">{p.headline}</p>}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                  {p.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.city}{p.state && `, ${p.state}`}</span>}
                  <span className="inline-flex items-center gap-1.5 capitalize"><span className={cn('h-2 w-2 rounded-full', AVAILABILITY_DOT[p.availability])} />{p.availability}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.profileViews} views</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`mailto:${p.user.email}`} className={buttonClass('outline', 'sm')}><Mail className="h-4 w-4" />Email</a>
                {p.phone ? <a href={`tel:${p.phone}`} className={buttonClass('outline', 'sm')}><Phone className="h-4 w-4" />Call</a> : <span className={buttonClass('outline', 'sm', 'opacity-40')}>No phone</span>}
                {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className={buttonClass('primary', 'sm', 'col-span-2 bg-success text-white')}><MessageSquare className="h-4 w-4" />WhatsApp</a>}
              </div>
              <div className="space-y-1 rounded-2xl bg-surface-2 p-3 text-xs">
                <p className="truncate"><span className="text-muted">Email:</span> {p.user.email}</p>
                {p.phone && <p><span className="text-muted">Phone:</span> {p.phone}</p>}
                <p><span className="text-muted">Joined:</span> {formatDate(p.createdAt)}{p.user.lastLoginAt && ` · active ${timeAgo(p.user.lastLoginAt)}`}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => setBoardOpen(true)}><BookmarkPlus className="h-4 w-4" />Shortlist</Button>
                <Button size="sm" variant="outline" onClick={share} aria-label="Copy comp card link"><Share2 className="h-4 w-4" /></Button>
                <Link href={`/artists/${p.slug}`} target="_blank" className={buttonClass('outline', 'sm')} aria-label="Open public comp card"><Globe className="h-4 w-4" /></Link>
              </div>
            </div>
          </motion.div>

          <div className="card space-y-4 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Agency controls</p>
            <Switch checked={p.isVerified} onChange={(v) => setFlag('isVerified', v)} label="Verified artist" description="Shows a blue tick; ranks higher in search" />
            <Switch checked={p.isFeatured} onChange={(v) => setFlag('isFeatured', v)} label="Feature on homepage" description="Appears in the ‘Fresh faces’ rail" />
            {boards.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">On your boards</p>
                <div className="flex flex-wrap gap-1.5">
                  {boards.map((b) => (
                    <Link key={b._id} href={`/agency/boards/${b._id}`} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold text-ink" style={{ background: b.color }}><Bookmark className="h-3 w-3" />{b.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <SectionCard title="At a glance" action={<ProgressRing value={p.completeness} size={64} stroke={7} label={<span className="text-xs font-extrabold">{p.completeness}%</span>} />}>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {attrs.map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-surface-2 p-3"><dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{k}</dt><dd className="mt-0.5 text-sm font-semibold">{v}</dd></div>
              ))}
            </dl>
            {p.bio && <p className="mt-5 whitespace-pre-line leading-relaxed text-fg/90">{p.bio}</p>}
            <div className="mt-5 space-y-3">
              {[['Categories', p.categories, 'bg-violet text-white'], ['Languages', p.languages, 'bg-sky text-ink'], ['Skills', p.skills, 'bg-lime text-ink']].map(([label, list, tone]) =>
                (list as string[]).length ? (
                  <div key={label as string}>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{label as string}</p>
                    <div className="flex flex-wrap gap-1.5">{(list as string[]).map((s) => <span key={s} className={cn('rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold', tone as string)}>{s}</span>)}</div>
                  </div>
                ) : null
              )}
            </div>
          </SectionCard>

          <SectionCard title={`Portfolio · ${photos.length}`}>
            {!photos.length ? <p className="text-sm text-muted">No portfolio photos yet.</p> : (
              <div className="columns-2 gap-3 sm:columns-3">
                {photos.map((ph, i) => (
                  <motion.button key={ph._id ?? ph.url} whileHover={{ scale: 1.02 }} onClick={() => setLightbox(i)} className="mb-3 block w-full overflow-hidden rounded-2xl border-2 border-ink dark:border-line">
                    <img src={ph.url} alt={ph.caption || `Photo ${i + 1}`} loading="lazy" className="w-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={`Videos · ${p.videos.length}`}>
            {!p.videos.length ? <p className="text-sm text-muted">No videos shared.</p> : (
              <div className="grid gap-4 sm:grid-cols-2">
                {p.videos.map((v) => (
                  <div key={v._id ?? v.url}>
                    <DriveVideo url={v.url} title={v.title} />
                    <p className="mt-2 flex items-center justify-between text-sm font-semibold">{v.title}<span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase text-muted">{v.type}</span></p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Credits" icon={<Film className="h-4 w-4 text-pink" />}>
              {!p.credits.length ? <p className="text-sm text-muted">No credits listed — likely a fresh face.</p> : (
                <ul className="space-y-2">
                  {p.credits.map((c) => (
                    <li key={c._id ?? c.title} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3">
                      <div><p className="font-semibold">{c.title}</p><p className="text-xs text-muted">{[c.role, c.director && `dir. ${c.director}`].filter(Boolean).join(' · ')}</p></div>
                      <div className="text-right text-xs"><p className="font-bold">{c.year ?? ''}</p><p className="text-muted">{c.type}</p></div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Application history">
              {!applications.length ? <p className="text-sm text-muted">Hasn’t applied to any castings yet.</p> : (
                <ul className="space-y-2">
                  {applications.map((a) => (
                    <li key={a._id}>
                      {a.castingCall ? (
                        <Link href={`/agency/castings/${a.castingCall._id}`} className="flex items-center justify-between gap-3 rounded-2xl p-3 transition hover:bg-surface-2">
                          <div className="min-w-0"><p className="truncate font-semibold">{a.castingCall.roleName}</p><p className="truncate text-xs text-muted">{a.castingCall.projectName} · {formatDate(a.createdAt)}</p></div>
                          <StatusPill status={a.status} />
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          {p.social && Object.values(p.social).some(Boolean) && (
            <SectionCard title="Elsewhere">
              <div className="flex flex-wrap gap-2">
                {Object.entries(p.social).filter(([, v]) => v).map(([k, v]) => (
                  <a key={k} href={String(v).startsWith('http') ? String(v) : `https://${v}`} target="_blank" rel="noreferrer" className={buttonClass('outline', 'sm', 'capitalize')}><Globe className="h-4 w-4" />{k}</a>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
            <motion.img key={lightbox} src={photos[lightbox].url} alt="" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-h-[88vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white" aria-label="Close"><X className="h-5 w-5" /></button>
            {photos.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white" aria-label="Previous"><ChevronLeft className="h-6 w-6" /></button>
                <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white" aria-label="Next"><ChevronRight className="h-6 w-6" /></button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddToBoardModal open={boardOpen} onClose={() => setBoardOpen(false)} profileId={p._id} artistName={p.stageName} onChange={() => mutate()} />
    </div>
  );
}
