'use client';

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { ImageUploader } from '@/components/media/image-uploader';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/misc';
import { api, errorMessage } from '@/lib/api';
import type { Hero } from '@/types';

interface Settings { hero: Hero; marquee: string[] }

const EMPTY_CTA = { label: '', href: '' };

export function HeroEditor() {
  const { data, mutate } = useSWR<{ settings: Settings }>('/cms/settings');
  const [hero, setHero] = useState<Hero | null>(null);
  const [marquee, setMarquee] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !hero) {
      setHero({ ...data.settings.hero, primaryCta: data.settings.hero.primaryCta ?? EMPTY_CTA, secondaryCta: data.settings.hero.secondaryCta ?? EMPTY_CTA });
      setMarquee(data.settings.marquee ?? []);
    }
  }, [data, hero]);

  if (!hero) return <Skeleton className="h-[60vh] rounded-3xl" />;

  // Functional updates: image uploads resolve asynchronously and must not clobber edits made meanwhile.
  const set = <K extends keyof Hero>(k: K, v: Hero[K]) => setHero((h) => (h ? { ...h, [k]: v } : h));
  const setImages = (fn: (imgs: string[]) => string[]) => setHero((h) => (h ? { ...h, images: fn(h.images ?? []) } : h));
  const images = hero.images ?? [];
  const stats = hero.stats ?? [];

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put<{ settings: Settings }>('/cms/settings', {
        hero: { ...hero, images: images.filter(Boolean), stats: stats.filter((s) => s.label && s.value) },
        marquee,
      });
      mutate(res, { revalidate: false });
      toast.success('Homepage hero published 🚀');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const addWord = () => {
    const w = word.trim();
    if (w && marquee.length < 16 && !marquee.includes(w)) setMarquee([...marquee, w]);
    setWord('');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <section className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Headline</h2>
          <Field label="Eyebrow" hint="Small sticker above the headline">{(id) => <Input id={id} value={hero.eyebrow ?? ''} onChange={(e) => set('eyebrow', e.target.value)} maxLength={80} />}</Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" required>{(id) => <Input id={id} value={hero.title} onChange={(e) => set('title', e.target.value)} maxLength={60} />}</Field>
            <Field label="Highlight" hint="Rendered in gradient after the title">{(id) => <Input id={id} value={hero.highlight ?? ''} onChange={(e) => set('highlight', e.target.value)} maxLength={60} />}</Field>
          </div>
          <Field label="Subtitle" hint={`${(hero.subtitle ?? '').length}/300`}>{(id) => <Textarea id={id} rows={3} value={hero.subtitle ?? ''} onChange={(e) => set('subtitle', e.target.value)} maxLength={300} />}</Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {(['primaryCta', 'secondaryCta'] as const).map((k) => (
              <div key={k} className="space-y-3 rounded-2xl bg-surface-2 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{k === 'primaryCta' ? 'Primary button' : 'Secondary button'}</p>
                <Input value={hero[k]?.label ?? ''} onChange={(e) => set(k, { ...(hero[k] ?? EMPTY_CTA), label: e.target.value })} placeholder="Label" className="h-10" maxLength={40} />
                <Input value={hero[k]?.href ?? ''} onChange={(e) => set(k, { ...(hero[k] ?? EMPTY_CTA), href: e.target.value })} placeholder="/register" className="h-10" />
              </div>
            ))}
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Hero collage</h2><span className="text-xs text-muted">{images.length}/6 images</span></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <ImageUploader value={img} onChange={(url) => setImages((imgs) => (url ? imgs.map((x, j) => (j === i ? url : x)) : imgs.filter((_, j) => j !== i)))} />
              </div>
            ))}
            {images.length < 6 && (
              <ImageUploader key={`new-${images.length}`} value={null} onChange={(url) => url && setImages((imgs) => [...imgs, url].slice(0, 6))} label="Add image" />
            )}
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Stats</h2>
            {stats.length < 4 && <Button size="sm" variant="outline" onClick={() => set('stats', [...stats, { label: '', value: '' }])}><Plus className="h-4 w-4" />Add stat</Button>}
          </div>
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input value={s.value} onChange={(e) => set('stats', stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="12K+" className="h-10 w-28" maxLength={12} />
              <Input value={s.label} onChange={(e) => set('stats', stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Artists" className="h-10" maxLength={30} />
              <Button size="icon" variant="ghost" onClick={() => set('stats', stats.filter((_, j) => j !== i))} aria-label="Remove stat"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Marquee ticker</h2>
          <div className="flex gap-2">
            <Input value={word} onChange={(e) => setWord(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWord())} placeholder="Add a word + Enter" className="h-10" maxLength={40} />
            <Button size="sm" variant="outline" onClick={addWord}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {marquee.map((w) => (
              <span key={w} className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-sun px-3 py-1 text-sm font-bold text-ink">
                {w}<button onClick={() => setMarquee(marquee.filter((x) => x !== w))} aria-label={`Remove ${w}`}><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Live preview</p>
        <div className="card overflow-hidden bg-bg p-6">
          {hero.eyebrow && <span className="eyebrow">{hero.eyebrow}</span>}
          <h3 className="mt-4 font-display text-4xl font-extrabold leading-[0.95]">
            {hero.title} {hero.highlight && <span className="text-gradient">{hero.highlight}</span>}
          </h3>
          {hero.subtitle && <p className="mt-3 text-sm text-muted">{hero.subtitle}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {hero.primaryCta?.label && <span className="rounded-xl border-2 border-ink bg-lime px-3 py-1.5 text-xs font-bold text-ink">{hero.primaryCta.label}</span>}
            {hero.secondaryCta?.label && <span className="rounded-xl border-2 border-ink bg-surface px-3 py-1.5 text-xs font-bold dark:border-line">{hero.secondaryCta.label}</span>}
          </div>
          {images.length > 0 && (
            <div className="mt-5 flex -space-x-4">
              {images.slice(0, 4).map((src, i) => (
                <motion.img key={src + i} src={src} alt="" initial={{ rotate: 0 }} animate={{ rotate: i % 2 ? 6 : -6 }} className="h-24 w-20 rounded-2xl border-2 border-ink object-cover shadow-brutal-sm" />
              ))}
            </div>
          )}
          {stats.length > 0 && (
            <div className="mt-5 flex gap-5">
              {stats.map((s, i) => <div key={i}><p className="font-display text-2xl font-extrabold">{s.value}</p><p className="text-[10px] uppercase tracking-wider text-muted">{s.label}</p></div>)}
            </div>
          )}
        </div>
        {marquee.length > 0 && (
          <div className="overflow-hidden rounded-2xl border-2 border-ink bg-lime py-2 text-ink">
            <div className="flex w-max animate-marquee gap-6 whitespace-nowrap font-display font-bold [--marquee-duration:18s]">
              {[...marquee, ...marquee].map((w, i) => <span key={i}>{w} ✦</span>)}
            </div>
          </div>
        )}
        <Button size="lg" className="w-full" onClick={save} loading={saving} disabled={hero.title.trim().length < 2}><Save className="h-4 w-4" />Publish hero</Button>
      </aside>
    </div>
  );
}
