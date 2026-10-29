'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, Link2, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOptions } from '@/hooks/use-options';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_MB = 5;

/** Uploads a single image via the API (→ imgbb) and resolves to its hosted URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file');
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Image must be under ${MAX_MB} MB`);
  const form = new FormData();
  form.append('image', file);
  const res = await api.post<{ image: { displayUrl: string; url: string } }>('/uploads/image', form);
  return res.image.displayUrl || res.image.url;
}

function UrlPaste({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState('');
  const add = () => {
    try {
      const u = new URL(url.trim());
      if (!/^https?:$/.test(u.protocol)) throw new Error();
      onAdd(u.toString());
      setUrl('');
    } catch {
      toast.error('Paste a valid image URL (https://…)');
    }
  };
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder="…or paste an image URL" className="h-10 pl-10" />
      </div>
      <Button size="sm" variant="outline" onClick={add} disabled={!url.trim()}>Add</Button>
    </div>
  );
}

interface SingleProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  aspect?: string;
  label?: string;
  className?: string;
}

/** Single image slot (headshot, cover, banner, poster). */
export function ImageUploader({ value, onChange, aspect = 'aspect-[4/5]', label = 'Upload image', className }: SingleProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const { features } = useOptions();

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
        className={cn('group relative overflow-hidden rounded-3xl border-2 border-dashed transition', aspect, drag ? 'border-pink bg-pink/10' : 'border-line/30 bg-surface-2/60 dark:border-line')}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-ink/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
              <Button size="sm" variant="outline" onClick={() => input.current?.click()} disabled={!features.imageUpload}>Replace</Button>
              <Button size="icon" variant="danger" onClick={() => onChange(null)} aria-label="Remove image"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy || !features.imageUpload}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted transition hover:text-fg disabled:cursor-not-allowed"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-lime text-ink shadow-brutal-sm">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
            </span>
            <span className="text-sm font-semibold">{features.imageUpload ? label : 'Uploads disabled'}</span>
            <span className="text-xs">{features.imageUpload ? `Drag & drop or click · max ${MAX_MB} MB` : 'Paste an image URL below'}</span>
          </button>
        )}
        {busy && value && <div className="absolute inset-0 grid place-items-center bg-ink/50"><Loader2 className="h-6 w-6 animate-spin text-lime" /></div>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }} />
      {!value && <UrlPaste onAdd={onChange} />}
    </div>
  );
}

interface GalleryProps {
  value: { url: string; caption?: string }[];
  onChange: (v: { url: string; caption?: string }[]) => void;
  max?: number;
}

/** Multi-image portfolio grid with parallel uploads. */
export function GalleryUploader({ value, onChange, max = 12 }: GalleryProps) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const { features } = useOptions();
  const remaining = max - value.length - pending;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, Math.max(0, remaining));
    if (!list.length) return toast.error(`You can add up to ${max} photos`);
    setPending((p) => p + list.length);
    const results = await Promise.allSettled(list.map(uploadImage));
    setPending((p) => p - list.length);
    const urls = results.flatMap((r) => (r.status === 'fulfilled' ? [{ url: r.value }] : []));
    const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    if (urls.length) onChange([...value, ...urls]);
    if (failed.length) toast.error(errorMessage(failed[0].reason));
    else toast.success(`${urls.length} photo${urls.length > 1 ? 's' : ''} added`);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {value.map((p, i) => (
            <motion.div key={p.url + i} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-ink dark:border-line">
              <img src={p.url} alt={p.caption || `Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-danger text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove photo">
                <Trash2 className="h-4 w-4" />
              </button>
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase text-ink">Cover</span>}
            </motion.div>
          ))}
          {Array.from({ length: pending }).map((_, i) => (
            <div key={`p${i}`} className="skeleton grid aspect-[3/4] place-items-center rounded-2xl"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
          ))}
        </AnimatePresence>
        {remaining > 0 && features.imageUpload && (
          <button type="button" onClick={() => input.current?.click()} className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line/30 text-muted transition hover:border-pink hover:text-pink dark:border-line">
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs font-semibold">Add photos</span>
            <span className="text-[10px]">{remaining} left</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      {remaining > 0 && <UrlPaste onAdd={(url) => onChange([...value, { url }])} />}
    </div>
  );
}
