'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Briefcase, ChevronLeft, ChevronRight, Eye, Globe, Mail, MapPin, MessageCircle, Phone, Printer, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DriveVideo } from '@/components/media/drive-video';
import { SmartImage } from '@/components/media/smart-image';
import { Reveal } from '@/components/motion/reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, heightLabel } from '@/lib/utils';
import type { ArtistProfile, User } from '@/types';

const AVAIL = {
  available: { label: 'Available for work', cls: 'bg-lime text-ink' },
  busy: { label: 'Currently busy', cls: 'bg-tangerine text-ink' },
  'on-shoot': { label: 'On a shoot', cls: 'bg-violet text-white' },
};

function Stat({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border-2 border-ink/10 bg-surface-2/50 px-4 py-3 dark:border-line">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold">{value}</p>
    </div>
  );
}

const ensureUrl = (u: string) => (/^https?:\/\//.test(u) ? u : `https://${u}`);

/** Digital comp card — the artist's shareable, printable portfolio page. */
export function CompCard({ profile: p, canContact }: { profile: ArtistProfile; canContact: boolean }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const owner = typeof p.user === 'object' ? (p.user as Pick<User, 'name' | 'email'>) : null;
  const name = p.stageName || owner?.name || 'Artist';
  const photos = p.photos?.length ? p.photos : p.headshot ? [{ url: p.headshot }] : [];
  const avail = AVAIL[p.availability] ?? AVAIL.available;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${name} · CastLab`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied');
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* Left: headshot + quick facts */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <motion.div initial={{ opacity: 0, rotate: -4, y: 30 }} animate={{ opacity: 1, rotate: -1.5, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }} className="relative rounded-3xl border-2 border-ink bg-surface p-3 shadow-brutal-lg dark:border-line">
            <SmartImage src={p.headshot || photos[0]?.url} alt={name} className="aspect-[4/5] rounded-2xl" />
            <span className={cn('absolute left-6 top-6 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold', avail.cls)}>● {avail.label}</span>
            <span className="absolute -right-3 -top-3 grid h-16 w-16 animate-spin-slow place-items-center rounded-full border-2 border-ink bg-sun text-[9px] font-extrabold uppercase leading-tight text-ink">
              <span className="text-center">Cast<br />Lab<br />★</span>
            </span>
          </motion.div>

          <div className="no-print flex gap-2">
            <Button variant="outline" className="flex-1" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline" className="flex-1" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print card</Button>
          </div>

          {canContact && (p.phone || owner?.email) && (
            <div className="card space-y-2 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-pink">Contact</p>
              {p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm font-semibold hover:text-pink"><Phone className="h-4 w-4" /> {p.phone}</a>}
              {(p.whatsapp || p.phone) && (
                <a href={`https://wa.me/${(p.whatsapp || p.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold hover:text-pink"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              )}
              {owner?.email && <a href={`mailto:${owner.email}`} className="flex items-center gap-2 text-sm font-semibold hover:text-pink"><Mail className="h-4 w-4" /> {owner.email}</a>}
            </div>
          )}
        </aside>

        {/* Right: details */}
        <div className="min-w-0 space-y-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              {p.categories?.map((c) => <Badge key={c} tone="violet">{c}</Badge>)}
              {p.experienceLevel && <Badge tone="sun">{p.experienceLevel}</Badge>}
            </div>
            <h1 className="mt-4 flex flex-wrap items-center gap-3 text-5xl font-extrabold leading-none sm:text-7xl">
              {name}
              {p.isVerified && <BadgeCheck className="h-10 w-10 fill-sky text-ink sm:h-12 sm:w-12" aria-label="Verified" />}
            </h1>
            {p.headline && <p className="mt-3 text-xl text-muted">{p.headline}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-fg/80">
              {p.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-pink" />{p.city}{p.willingToTravel && ' · Open to travel'}</span>}
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-pink" />{p.profileViews} views</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              <Stat label="Age" value={p.age ? `${p.age} yrs` : undefined} />
              <Stat label="Gender" value={p.gender} />
              <Stat label="Height" value={p.heightCm ? heightLabel(p.heightCm) : undefined} />
              <Stat label="Weight" value={p.weightKg ? `${p.weightKg} kg` : undefined} />
              <Stat label="Body type" value={p.bodyType} />
              <Stat label="Skin tone" value={p.skinTone} />
              <Stat label="Eyes" value={p.eyeColor} />
              <Stat label="Hair" value={p.hairColor} />
            </div>
          </Reveal>

          {p.bio && (
            <Reveal>
              <h2 className="mb-3 text-2xl font-bold">About</h2>
              <p className="whitespace-pre-line text-lg leading-relaxed text-fg/80">{p.bio}</p>
            </Reveal>
          )}

          {(p.languages?.length > 0 || p.skills?.length > 0) && (
            <Reveal className="grid gap-6 md:grid-cols-2">
              {p.languages?.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">Languages</h3>
                  <div className="flex flex-wrap gap-2">{p.languages.map((l) => <span key={l} className="rounded-full border-2 border-ink bg-sky/20 px-3 py-1 text-sm font-semibold dark:border-sky/40">{l}</span>)}</div>
                </div>
              )}
              {p.skills?.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">Skills</h3>
                  <div className="flex flex-wrap gap-2">{p.skills.map((s) => <span key={s} className="rounded-full border-2 border-ink bg-lime/30 px-3 py-1 text-sm font-semibold dark:border-lime/40">{s}</span>)}</div>
                </div>
              )}
            </Reveal>
          )}

          {photos.length > 0 && (
            <Reveal>
              <h2 className="mb-4 text-2xl font-bold">Portfolio</h2>
              <div className="columns-2 gap-3 sm:columns-3">
                {photos.map((ph, i) => (
                  <button key={ph.url + i} onClick={() => setLightbox(i)} className="group mb-3 block w-full overflow-hidden rounded-2xl border-2 border-ink dark:border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.url} alt={ph.caption || `${name} photo ${i + 1}`} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {p.videos?.length > 0 && (
            <Reveal>
              <h2 className="mb-4 text-2xl font-bold">Showreel & tapes</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {p.videos.map((v) => (
                  <div key={v._id || v.url} className="space-y-2">
                    <DriveVideo url={v.url} title={v.title} />
                    <p className="flex items-center justify-between text-sm font-semibold">{v.title} <Badge>{v.type}</Badge></p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {p.credits?.length > 0 && (
            <Reveal>
              <h2 className="mb-4 text-2xl font-bold">Credits</h2>
              <div className="divide-y-2 divide-dashed divide-line/15 rounded-3xl border-2 border-ink bg-surface dark:divide-line dark:border-line">
                {p.credits.map((c) => (
                  <div key={c._id || c.title} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-pink/15 text-pink"><Briefcase className="h-5 w-5" /></span>
                      <div>
                        <p className="font-bold">{c.title}</p>
                        <p className="text-xs text-muted">{[c.role, c.director && `dir. ${c.director}`].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2"><Badge>{c.type}</Badge>{c.year && <span className="font-mono text-sm text-muted">{c.year}</span>}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {p.social && Object.values(p.social).some(Boolean) && (
            <Reveal className="flex flex-wrap gap-2">
              {Object.entries(p.social).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={ensureUrl(v as string)} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-surface px-4 py-2 text-sm font-semibold capitalize transition hover:bg-lime hover:text-ink dark:border-line">
                  <Globe className="h-4 w-4" /> {k}
                </a>
              ))}
            </Reveal>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
            <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close"><X className="h-6 w-6" /></button>
            {photos.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setLightbox((i) => ((i ?? 0) - 1 + photos.length) % photos.length); }} className="absolute left-4 rounded-full bg-white/10 p-3 text-white" aria-label="Previous"><ChevronLeft className="h-6 w-6" /></button>
                <button onClick={(e) => { e.stopPropagation(); setLightbox((i) => ((i ?? 0) + 1) % photos.length); }} className="absolute right-4 rounded-full bg-white/10 p-3 text-white" aria-label="Next"><ChevronRight className="h-6 w-6" /></button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img key={lightbox} src={photos[lightbox].url} alt="" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-h-[88vh] max-w-full rounded-2xl border-2 border-white/20 object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
