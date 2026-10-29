'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Image as ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { ImageUploader } from '@/components/media/image-uploader';
import { SmartImage } from '@/components/media/smart-image';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { useOptions } from '@/hooks/use-options';
import { api, errorMessage } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import type { Banner, Release } from '@/types';

type Item = { _id: string; isActive: boolean; order: number };

/** Shared list mechanics for ordered CMS collections: toggle, reorder, delete. */
function useCollection<T extends Item>(endpoint: string) {
  const { data, isLoading, mutate } = useSWR<{ items: T[] }>(endpoint);
  const items = data?.items ?? [];

  const toggle = async (item: T) => {
    try {
      await api.patch(`${endpoint}/${item._id}`, { isActive: !item.isActive });
      toast.success(item.isActive ? 'Hidden from homepage' : 'Now live on homepage');
      mutate();
    } catch (err) { toast.error(errorMessage(err)); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    mutate({ items: next }, { revalidate: false });
    try { await api.put(`${endpoint}/reorder`, { ids: next.map((i) => i._id) }); } catch (err) { toast.error(errorMessage(err)); mutate(); }
  };

  const remove = async (item: T) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try { await api.del(`${endpoint}/${item._id}`); toast.success('Deleted'); mutate(); } catch (err) { toast.error(errorMessage(err)); }
  };

  return { items, isLoading, mutate, toggle, move, remove };
}

function RowControls({ item, index, total, onMove, onToggle, onEdit, onDelete }: {
  item: Item; index: number; total: number; onMove: (d: -1 | 1) => void; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button size="icon" variant="ghost" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" onClick={onToggle} aria-label={item.isActive ? 'Hide' : 'Show'}>{item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted" />}</Button>
      <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete" className="text-danger"><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
}

// ── Banners ───────────────────────────────────────────────────

const ACCENTS = ['#c6ff3d', '#ff4fa3', '#8b5cf6', '#ffd23f', '#22d3ee', '#ff7a1a'];
type BannerDraft = Omit<Banner, '_id' | 'order'> & { _id?: string };
const EMPTY_BANNER: BannerDraft = { title: '', subtitle: '', image: '', ctaLabel: '', ctaLink: '', accent: ACCENTS[0], isActive: true };

export function BannersEditor() {
  const { items, isLoading, mutate, toggle, move, remove } = useCollection<Banner>('/cms/banners');
  const [editing, setEditing] = useState<BannerDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { _id, ...body } = editing;
    try {
      if (_id) await api.patch(`/cms/banners/${_id}`, body);
      else await api.post('/cms/banners', body);
      toast.success(_id ? 'Banner updated' : 'Banner added');
      setEditing(null);
      mutate();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Promo banners rotate in the homepage carousel. Order = display order.</p>
        <Button onClick={() => setEditing({ ...EMPTY_BANNER })}><Plus className="h-4 w-4" />Add banner</Button>
      </div>
      {isLoading ? <Skeleton className="h-64 rounded-3xl" /> : !items.length ? (
        <EmptyState icon={<ImageIcon />} title="No banners" description="Add a banner to promote an audition, workshop or announcement." />
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((b, i) => (
              <motion.div key={b._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn('card flex flex-col overflow-hidden sm:flex-row', !b.isActive && 'opacity-60')}>
                <div className="relative sm:w-72 sm:shrink-0">
                  <SmartImage src={b.image} alt={b.title} className="h-40 sm:h-full" />
                  <span className="absolute left-3 top-3 h-6 w-6 rounded-full border-2 border-ink" style={{ background: b.accent }} />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold">#{i + 1}</span>
                      {!b.isActive && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-muted">Hidden</span>}
                    </div>
                    <h3 className="mt-1 font-display text-xl font-bold">{b.title}</h3>
                    {b.subtitle && <p className="mt-1 text-sm text-muted">{b.subtitle}</p>}
                    {b.ctaLabel && <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-pink"><ExternalLink className="h-3 w-3" />{b.ctaLabel} → {b.ctaLink}</p>}
                  </div>
                  <RowControls item={b} index={i} total={items.length} onMove={(d) => move(i, d)} onToggle={() => toggle(b)} onEdit={() => setEditing({ ...b })} onDelete={() => remove(b)} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? 'Edit banner' : 'New banner'} size="lg"
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={saving} disabled={!editing?.title || !editing?.image}>Save banner</Button></>}>
        {editing && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Image *</p>
              <ImageUploader value={editing.image || null} onChange={(url) => setEditing((d) => d && { ...d, image: url ?? '' })} aspect="aspect-video" label="Upload banner" />
            </div>
            <div className="space-y-4">
              <Field label="Title" required>{(id) => <Input id={id} value={editing.title} onChange={(e) => setEditing((d) => d && { ...d, title: e.target.value })} maxLength={100} />}</Field>
              <Field label="Subtitle">{(id) => <Textarea id={id} rows={3} value={editing.subtitle ?? ''} onChange={(e) => setEditing((d) => d && { ...d, subtitle: e.target.value })} maxLength={240} />}</Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Button label">{(id) => <Input id={id} value={editing.ctaLabel ?? ''} onChange={(e) => setEditing((d) => d && { ...d, ctaLabel: e.target.value })} className="h-10" />}</Field>
                <Field label="Button link">{(id) => <Input id={id} value={editing.ctaLink ?? ''} onChange={(e) => setEditing((d) => d && { ...d, ctaLink: e.target.value })} placeholder="/castings" className="h-10" />}</Field>
              </div>
              <Field label="Accent colour">
                {() => (
                  <div className="flex flex-wrap items-center gap-2">
                    {ACCENTS.map((c) => (
                      <button key={c} type="button" onClick={() => setEditing((d) => d && { ...d, accent: c })} className={cn('h-9 w-9 rounded-xl border-2 border-ink', editing.accent === c && 'ring-4 ring-pink/40')} style={{ background: c }} aria-label={c} />
                    ))}
                    <input type="color" value={editing.accent} onChange={(e) => setEditing((d) => d && { ...d, accent: e.target.value })} className="h-9 w-12 cursor-pointer rounded-xl border-2 border-ink bg-transparent" aria-label="Custom colour" />
                  </div>
                )}
              </Field>
              <Switch checked={editing.isActive} onChange={(v) => setEditing((d) => d && { ...d, isActive: v })} label="Show on homepage" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Recent releases ───────────────────────────────────────────

interface ReleaseDraft {
  _id?: string;
  title: string;
  type: string;
  poster: string;
  platform: string;
  releaseDate: string;
  description: string;
  castedCount: number | '';
  link: string;
  isActive: boolean;
}
const EMPTY_RELEASE: ReleaseDraft = { title: '', type: 'Feature Film', poster: '', platform: '', releaseDate: '', description: '', castedCount: '', link: '', isActive: true };

const toDraft = (r: Release): ReleaseDraft => ({
  _id: r._id,
  title: r.title,
  type: r.type,
  poster: r.poster,
  platform: r.platform ?? '',
  releaseDate: r.releaseDate ? new Date(r.releaseDate).toISOString().slice(0, 10) : '',
  description: r.description ?? '',
  castedCount: r.castedCount ?? '',
  link: r.link ?? '',
  isActive: r.isActive,
});

export function ReleasesEditor() {
  const { options } = useOptions();
  const { items, isLoading, mutate, toggle, move, remove } = useCollection<Release>('/cms/releases');
  const [editing, setEditing] = useState<ReleaseDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && !editing.type && options.releaseTypes[0]) setEditing((d) => d && { ...d, type: options.releaseTypes[0] });
  }, [editing, options.releaseTypes]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { _id, ...body } = editing;
    try {
      if (_id) await api.patch(`/cms/releases/${_id}`, body);
      else await api.post('/cms/releases', body);
      toast.success(_id ? 'Release updated' : 'Release added');
      setEditing(null);
      mutate();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Showcase projects your artists were cast in. Social proof that converts sign-ups.</p>
        <Button onClick={() => setEditing({ ...EMPTY_RELEASE })}><Plus className="h-4 w-4" />Add release</Button>
      </div>
      {isLoading ? <Skeleton className="h-64 rounded-3xl" /> : !items.length ? (
        <EmptyState icon={<ImageIcon />} title="No releases" description="Add a poster for a film or series cast through CastLab." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          <AnimatePresence initial={false}>
            {items.map((r, i) => (
              <motion.div key={r._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={cn('card overflow-hidden', !r.isActive && 'opacity-60')}>
                <div className="relative">
                  <SmartImage src={r.poster} alt={r.title} className="aspect-[2/3]" />
                  <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-sun px-2 py-0.5 text-[10px] font-bold text-ink">#{i + 1}</span>
                  {r.platform && <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">{r.platform}</span>}
                </div>
                <div className="p-3">
                  <p className="truncate font-display font-bold">{r.title}</p>
                  <p className="truncate text-xs text-muted">{r.type}{r.releaseDate && ` · ${formatDate(r.releaseDate, { month: 'short', year: 'numeric' })}`}</p>
                  {r.castedCount ? <p className="mt-1 text-xs font-semibold text-pink">{r.castedCount} artists cast</p> : null}
                  <div className="mt-2 -mx-1"><RowControls item={r} index={i} total={items.length} onMove={(d) => move(i, d)} onToggle={() => toggle(r)} onEdit={() => setEditing(toDraft(r))} onDelete={() => remove(r)} /></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? 'Edit release' : 'New release'} size="lg"
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={saving} disabled={!editing?.title || !editing?.poster}>Save release</Button></>}>
        {editing && (
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Poster *</p>
              <ImageUploader value={editing.poster || null} onChange={(url) => setEditing((d) => d && { ...d, poster: url ?? '' })} aspect="aspect-[2/3]" label="Upload poster" />
            </div>
            <div className="space-y-4">
              <Field label="Title" required>{(id) => <Input id={id} value={editing.title} onChange={(e) => setEditing((d) => d && { ...d, title: e.target.value })} maxLength={100} />}</Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Type">{(id) => <Select id={id} value={editing.type} onChange={(e) => setEditing((d) => d && { ...d, type: e.target.value })} options={options.releaseTypes} />}</Field>
                <Field label="Platform">{(id) => <Input id={id} value={editing.platform} onChange={(e) => setEditing((d) => d && { ...d, platform: e.target.value })} placeholder="Netflix, In Theatres…" />}</Field>
                <Field label="Release date">{(id) => <Input id={id} type="date" value={editing.releaseDate} onChange={(e) => setEditing((d) => d && { ...d, releaseDate: e.target.value })} />}</Field>
                <Field label="Artists cast via CastLab">{(id) => <Input id={id} type="number" min={0} value={editing.castedCount} onChange={(e) => setEditing((d) => d && { ...d, castedCount: e.target.value === '' ? '' : Number(e.target.value) })} />}</Field>
              </div>
              <Field label="Link" hint="Trailer or streaming page (https://…)">{(id) => <Input id={id} value={editing.link} onChange={(e) => setEditing((d) => d && { ...d, link: e.target.value })} placeholder="https://" />}</Field>
              <Field label="Description">{(id) => <Textarea id={id} rows={3} value={editing.description} onChange={(e) => setEditing((d) => d && { ...d, description: e.target.value })} maxLength={500} />}</Field>
              <Switch checked={editing.isActive} onChange={(v) => setEditing((d) => d && { ...d, isActive: v })} label="Show on homepage" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
