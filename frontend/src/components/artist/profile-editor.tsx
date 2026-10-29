'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, Camera, CheckCircle2, Circle, Clapperboard, ExternalLink, Palette, Plus, Save, Settings2, Trash2, UserRound, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DriveHelp, DriveVideo } from '@/components/media/drive-video';
import { GalleryUploader, ImageUploader } from '@/components/media/image-uploader';
import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { ProgressRing } from '@/components/ui/misc';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useOptions } from '@/hooks/use-options';
import { api, ApiError, errorMessage } from '@/lib/api';
import { isDriveLink } from '@/lib/drive';
import { cn, heightLabel } from '@/lib/utils';
import type { ArtistProfile, ChecklistItem, Credit, Photo, Video as VideoT } from '@/types';

/** Editable subset of the profile, normalised for controlled inputs. */
type FormState = {
  stageName: string; headline: string; bio: string; gender: string; dob: string; city: string; state: string; phone: string; whatsapp: string;
  heightCm: string; weightKg: string; bodyType: string; skinTone: string; eyeColor: string; hairColor: string;
  categories: string[]; experienceLevel: string; languages: string[]; skills: string[];
  headshot: string | null; photos: Photo[]; videos: VideoT[]; credits: Credit[];
  social: { instagram: string; youtube: string; imdb: string; website: string };
  availability: ArtistProfile['availability']; willingToTravel: boolean; isPublic: boolean;
};

const toForm = (p: ArtistProfile): FormState => ({
  stageName: p.stageName ?? '', headline: p.headline ?? '', bio: p.bio ?? '', gender: p.gender ?? '',
  dob: p.dob ? p.dob.slice(0, 10) : '', city: p.city ?? '', state: p.state ?? '', phone: p.phone ?? '', whatsapp: p.whatsapp ?? '',
  heightCm: p.heightCm?.toString() ?? '', weightKg: p.weightKg?.toString() ?? '',
  bodyType: p.bodyType ?? '', skinTone: p.skinTone ?? '', eyeColor: p.eyeColor ?? '', hairColor: p.hairColor ?? '',
  categories: p.categories ?? [], experienceLevel: p.experienceLevel ?? '', languages: p.languages ?? [], skills: p.skills ?? [],
  headshot: p.headshot ?? null,
  photos: (p.photos ?? []).map(({ url, caption }) => ({ url, caption })),
  videos: (p.videos ?? []).map(({ title, url, type }) => ({ title, url, type })),
  credits: (p.credits ?? []).map(({ title, role, year, type, director }) => ({ title, role: role ?? '', year: year ?? null, type, director: director ?? '' })),
  social: { instagram: p.social?.instagram ?? '', youtube: p.social?.youtube ?? '', imdb: p.social?.imdb ?? '', website: p.social?.website ?? '' },
  availability: p.availability, willingToTravel: p.willingToTravel, isPublic: p.isPublic,
});

const SECTIONS = [
  { id: 'basics', label: 'Basics', icon: UserRound },
  { id: 'look', label: 'Look', icon: Palette },
  { id: 'craft', label: 'Craft & skills', icon: Clapperboard },
  { id: 'media', label: 'Photos & videos', icon: Camera },
  { id: 'credits', label: 'Credits', icon: Briefcase },
  { id: 'prefs', label: 'Links & privacy', icon: Settings2 },
] as const;

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-6 sm:p-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function ProfileEditor({ profile, checklist, onSaved }: { profile: ArtistProfile; checklist: ChecklistItem[]; onSaved: (p: { profile: ArtistProfile; checklist: ChecklistItem[] }) => void }) {
  const { options } = useOptions();
  const { refresh } = useAuth();
  const initial = useMemo(() => toForm(profile), [profile]);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string>('basics');
  const [customSkill, setCustomSkill] = useState('');
  const [newVideo, setNewVideo] = useState<VideoT>({ title: '', url: '', type: 'Showreel' });
  const navLock = useRef(false);

  useEffect(() => setForm(initial), [initial]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  // Scroll-spy for the section nav
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (navLock.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const bind = (k: keyof FormState) => ({
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
  });

  const jump = (id: string) => {
    setActive(id);
    navLock.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => (navLock.current = false), 800);
  };

  const addVideo = () => {
    if (!newVideo.title.trim()) return toast.error('Give your video a title');
    if (!isDriveLink(newVideo.url)) return toast.error('Paste a Google Drive file share link');
    set('videos', [...form.videos, { ...newVideo, title: newVideo.title.trim() }]);
    setNewVideo({ title: '', url: '', type: 'Showreel' });
  };

  const addSkill = () => {
    const s = customSkill.trim();
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]);
    setCustomSkill('');
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        credits: form.credits.filter((c) => c.title.trim()).map((c) => ({ ...c, year: c.year || null })),
      };
      const res = await api.put<{ profile: ArtistProfile; checklist: ChecklistItem[] }>('/profiles/me', payload);
      onSaved(res);
      refresh();
      toast.success(`Saved! Profile is ${res.profile.completeness}% complete`);
    } catch (err) {
      const detail = err instanceof ApiError ? err.details?.[0] : undefined;
      toast.error(detail ? `${detail.path}: ${detail.message}` : errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const score = profile.completeness;

  return (
    <div className="grid gap-8 xl:grid-cols-[200px_1fr] 2xl:grid-cols-[200px_1fr_300px]">
      {/* Section nav */}
      <nav className="hidden xl:block">
        <div className="sticky top-24 space-y-1">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => jump(s.id)} className={cn('relative flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition', active === s.id ? 'text-ink' : 'text-muted hover:text-fg')}>
              {active === s.id && <motion.span layoutId="editor-nav" className="absolute inset-0 rounded-2xl border-2 border-ink bg-sun" />}
              <s.icon className="relative h-4 w-4" /><span className="relative">{s.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="min-w-0 space-y-6 pb-28">
        <Section id="basics" title="The basics" description="How casting teams will find and address you.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Stage name" required>{(id) => <Input id={id} {...bind('stageName')} placeholder="Aanya Kapoor" />}</Field>
            <Field label="Headline" hint="One punchy line, e.g. “Hindi/English actor · trained dancer”">{(id) => <Input id={id} {...bind('headline')} maxLength={120} />}</Field>
          </div>
          <Field label="Bio" hint={`${form.bio.length}/1500 · Training, highlights, what roles excite you`}>{(id) => <Textarea id={id} {...bind('bio')} rows={5} maxLength={1500} />}</Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Gender" required>{(id) => <Select id={id} {...bind('gender')} options={options.genders} />}</Field>
            <Field label="Date of birth" required hint="Only your age is shown publicly">{(id) => <Input id={id} type="date" {...bind('dob')} max={new Date().toISOString().slice(0, 10)} />}</Field>
            <Field label="Experience">{(id) => <Select id={id} {...bind('experienceLevel')} options={options.experienceLevels} />}</Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City" required>
              {(id) => (
                <>
                  <Input id={id} list="cities" {...bind('city')} placeholder="Mumbai" />
                  <datalist id="cities">{options.cities.map((c) => <option key={c} value={c} />)}</datalist>
                </>
              )}
            </Field>
            <Field label="State">{(id) => <Input id={id} {...bind('state')} placeholder="Maharashtra" />}</Field>
            <Field label="Phone" hint="Visible only to verified casting teams">{(id) => <Input id={id} type="tel" {...bind('phone')} placeholder="+91 98765 43210" />}</Field>
            <Field label="WhatsApp">{(id) => <Input id={id} type="tel" {...bind('whatsapp')} placeholder="Same as phone" />}</Field>
          </div>
        </Section>

        <Section id="look" title="Your look" description="Physical details help us match you to character briefs.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Height (cm)" hint={form.heightCm ? heightLabel(Number(form.heightCm)) : 'e.g. 168'}>{(id) => <Input id={id} type="number" min={50} max={250} {...bind('heightCm')} />}</Field>
            <Field label="Weight (kg)">{(id) => <Input id={id} type="number" min={10} max={250} {...bind('weightKg')} />}</Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Body type">{(id) => <Select id={id} {...bind('bodyType')} options={options.bodyTypes} />}</Field>
            <Field label="Skin tone">{(id) => <Select id={id} {...bind('skinTone')} options={options.skinTones} />}</Field>
            <Field label="Eye colour">{(id) => <Select id={id} {...bind('eyeColor')} options={options.eyeColors} />}</Field>
            <Field label="Hair colour">{(id) => <Select id={id} {...bind('hairColor')} options={options.hairColors} />}</Field>
          </div>
        </Section>

        <Section id="craft" title="Craft & skills" description="Pick everything that genuinely applies — Smart Match uses these.">
          <Field label="I work as (up to 6)">{() => <ChipSelect options={options.categories} value={form.categories} onChange={(v) => set('categories', v)} max={6} />}</Field>
          <Field label="Languages I can perform in">{() => <ChipSelect options={options.languages} value={form.languages} onChange={(v) => set('languages', v)} max={15} />}</Field>
          <Field label="Skills">
            {() => (
              <div className="space-y-3">
                <ChipSelect options={Array.from(new Set([...options.skills, ...form.skills]))} value={form.skills} onChange={(v) => set('skills', v)} max={25} />
                <div className="flex max-w-sm gap-2">
                  <Input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add another skill…" className="h-10" />
                  <Button size="sm" variant="outline" onClick={addSkill} disabled={!customSkill.trim()}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </Field>
        </Section>

        <Section id="media" title="Photos & videos" description="Recent, unfiltered pictures work best. Videos are shared via Google Drive links.">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <Field label="Headshot" required>{() => <ImageUploader value={form.headshot} onChange={(v) => set('headshot', v)} label="Upload headshot" />}</Field>
            <Field label={`Portfolio (${form.photos.length}/12)`} hint="Add at least 3: close-up, profile and full length.">{() => <GalleryUploader value={form.photos} onChange={(v) => set('photos', v)} />}</Field>
          </div>

          <div className="space-y-4 border-t-2 border-dashed border-line/15 pt-6 dark:border-line">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted"><Video className="h-4 w-4" /> Showreel & tapes ({form.videos.length}/8)</p>
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence initial={false}>
                {form.videos.map((v, i) => (
                  <motion.div key={v.url + i} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-2">
                    <DriveVideo url={v.url} title={v.title} />
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{v.title} <span className="text-muted">· {v.type}</span></p>
                      <button onClick={() => set('videos', form.videos.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" aria-label="Remove video"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {form.videos.length < 8 && (
              <div className="rounded-2xl border-2 border-dashed border-violet/40 bg-violet/5 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                  <Input value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} placeholder="Title (e.g. Showreel 2026)" className="h-10" />
                  <Select value={newVideo.type} onChange={(e) => setNewVideo({ ...newVideo, type: e.target.value || 'Showreel' })} options={options.videoTypes} className="h-10" placeholder="Type" />
                </div>
                <div className="mt-3 flex gap-2">
                  <Input value={newVideo.url} onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value.trim() })} placeholder="https://drive.google.com/file/d/…/view" className={cn('h-10', newVideo.url && !isDriveLink(newVideo.url) && 'border-danger')} />
                  <Button size="sm" variant="pink" onClick={addVideo} className="h-10"><Plus className="h-4 w-4" /> Add</Button>
                </div>
                <div className="mt-2"><DriveHelp /></div>
              </div>
            )}
          </div>
        </Section>

        <Section id="credits" title="Credits" description="Films, series, ads, theatre — newest first. Freshers can skip this.">
          <AnimatePresence initial={false}>
            {form.credits.map((c, i) => {
              const upd = (patch: Partial<Credit>) => set('credits', form.credits.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="grid gap-3 rounded-2xl border-2 border-ink/10 bg-surface-2/40 p-4 sm:grid-cols-[2fr_1.4fr_1fr_90px_auto] dark:border-line">
                  <Input value={c.title} onChange={(e) => upd({ title: e.target.value })} placeholder="Project title" className="h-10" />
                  <Input value={c.role ?? ''} onChange={(e) => upd({ role: e.target.value })} placeholder="Your role" className="h-10" />
                  <Select value={c.type} onChange={(e) => upd({ type: e.target.value || 'Film' })} options={options.creditTypes} className="h-10" placeholder="Type" />
                  <Input type="number" value={c.year ?? ''} onChange={(e) => upd({ year: e.target.value ? Number(e.target.value) : null })} placeholder="Year" className="h-10" />
                  <button onClick={() => set('credits', form.credits.filter((_, j) => j !== i))} className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-danger/10 hover:text-danger" aria-label="Remove credit"><Trash2 className="h-4 w-4" /></button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <Button variant="outline" size="sm" onClick={() => set('credits', [...form.credits, { title: '', role: '', type: 'Film', year: new Date().getFullYear() }])} disabled={form.credits.length >= 40}>
            <Plus className="h-4 w-4" /> Add credit
          </Button>
        </Section>

        <Section id="prefs" title="Links & privacy">
          <div className="grid gap-5 sm:grid-cols-2">
            {(['instagram', 'youtube', 'imdb', 'website'] as const).map((k) => (
              <Field key={k} label={k}>{(id) => <Input id={id} value={form.social[k]} onChange={(e) => set('social', { ...form.social, [k]: e.target.value })} placeholder={`https://${k === 'website' ? 'yoursite.com' : `${k}.com/…`}`} />}</Field>
            ))}
          </div>
          <div className="space-y-4 rounded-2xl bg-surface-2/50 p-5">
            <Switch checked={form.willingToTravel} onChange={(v) => set('willingToTravel', v)} label="Open to travel" description="Show up for outstation shoots in Smart Match" />
            <Switch checked={form.isPublic} onChange={(v) => set('isPublic', v)} label="Public comp card" description="Anyone with the link can view your portfolio (contact details stay private)" />
          </div>
        </Section>
      </div>

      {/* Strength sidebar */}
      <aside className="hidden 2xl:block">
        <div className="card sticky top-24 space-y-4 p-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={score} size={84} stroke={9} />
            <div>
              <p className="font-display text-lg font-bold">Profile strength</p>
              <p className="text-xs text-muted">{score >= 100 ? 'You’re casting-ready!' : 'Save to update your score'}</p>
            </div>
          </div>
          <ul className="space-y-1.5 text-sm">
            {checklist.map((c) => (
              <li key={c.key} className={cn('flex items-center gap-2', c.done && 'text-muted')}>
                {c.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-lime" /> : <Circle className="h-4 w-4 shrink-0 text-pink" />}
                <span className={cn(c.done && 'line-through')}>{c.label}</span>
                <span className="ml-auto text-xs font-bold text-muted">{c.weight}</span>
              </li>
            ))}
          </ul>
          <Link href={`/artists/${profile.slug}`} target="_blank" className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink py-2 text-sm font-semibold transition hover:bg-lime hover:text-ink dark:border-line">
            Preview comp card <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Sticky save bar */}
      <AnimatePresence>
        {dirty && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', bounce: 0.25 }} className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:pl-[272px]">
            <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-ink px-5 py-3 text-white shadow-brutal-lg dark:border-lime">
              <p className="text-sm font-semibold">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setForm(initial)}>Discard</Button>
                <Button size="sm" loading={saving} onClick={save}><Save className="h-4 w-4" /> Save profile</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
