'use client';

import { motion } from 'framer-motion';
import { Clapperboard, FileVideo, Image as ImageIcon, ListChecks, Save, Sparkles, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/media/image-uploader';
import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useOptions } from '@/hooks/use-options';
import { api, ApiError, errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CastingCall, CastingStatus } from '@/types';

type Num = number | '';

export interface CastingFormValues {
  title: string;
  projectName: string;
  projectType: string;
  productionHouse: string;
  description: string;
  roleName: string;
  roleType: string;
  characterBrief: string;
  gender: string;
  ageMin: Num;
  ageMax: Num;
  heightMinCm: Num;
  heightMaxCm: Num;
  languages: string[];
  skills: string[];
  categories: string[];
  location: string;
  shootStart: string;
  shootEnd: string;
  compensation: string;
  isPaid: boolean;
  deadline: string;
  selfTapeRequired: boolean;
  selfTapeInstructions: string;
  coverImage: string | null;
  tags: string[];
  isUrgent: boolean;
  status: CastingStatus;
}

const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const toLocalDateTime = (d?: string | null) => {
  if (!d) return '';
  const dt = new Date(d);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function castingToForm(c?: CastingCall | null): CastingFormValues {
  const inTwoWeeks = new Date(Date.now() + 14 * 86_400_000);
  inTwoWeeks.setHours(23, 59, 0, 0);
  return {
    title: c?.title ?? '',
    projectName: c?.projectName ?? '',
    projectType: c?.projectType ?? '',
    productionHouse: c?.productionHouse ?? '',
    description: c?.description ?? '',
    roleName: c?.roleName ?? '',
    roleType: c?.roleType ?? 'Supporting',
    characterBrief: c?.characterBrief ?? '',
    gender: c?.gender ?? 'Any',
    ageMin: c?.ageMin ?? '',
    ageMax: c?.ageMax ?? '',
    heightMinCm: c?.heightMinCm ?? '',
    heightMaxCm: c?.heightMaxCm ?? '',
    languages: c?.languages ?? [],
    skills: c?.skills ?? [],
    categories: c?.categories ?? [],
    location: c?.location ?? '',
    shootStart: toDateInput(c?.shootStart),
    shootEnd: toDateInput(c?.shootEnd),
    compensation: c?.compensation ?? '',
    isPaid: c?.isPaid ?? true,
    deadline: toLocalDateTime(c?.deadline ?? inTwoWeeks.toISOString()),
    selfTapeRequired: c?.selfTapeRequired ?? false,
    selfTapeInstructions: c?.selfTapeInstructions ?? '',
    coverImage: c?.coverImage ?? null,
    tags: c?.tags ?? [],
    isUrgent: c?.isUrgent ?? false,
    status: c?.status ?? 'open',
  };
}

function Section({ icon: Icon, title, description, children, index }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string; children: React.ReactNode; index: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-sun text-ink"><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.section>
  );
}

export function CastingForm({ initial, castingId }: { initial?: CastingCall | null; castingId?: string }) {
  const router = useRouter();
  const { options } = useOptions();
  const [v, setV] = useState<CastingFormValues>(() => castingToForm(initial));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState('');

  const set = <K extends keyof CastingFormValues>(key: K, value: CastingFormValues[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };
  const num = (key: 'ageMin' | 'ageMax' | 'heightMinCm' | 'heightMaxCm') => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, e.target.value === '' ? '' : Number(e.target.value));

  const submit = async (status?: CastingStatus) => {
    const payload = {
      ...v,
      status: status ?? v.status,
      deadline: v.deadline ? new Date(v.deadline).toISOString() : '',
      coverImage: v.coverImage || '',
    };
    setSaving(true);
    setErrors({});
    try {
      if (castingId) {
        await api.put(`/castings/${castingId}`, payload);
        toast.success('Casting updated');
        router.push(`/agency/castings/${castingId}`);
      } else {
        const { casting } = await api.post<{ casting: CastingCall }>('/castings', payload);
        toast.success(payload.status === 'open' ? 'Casting is live — matching artists are being alerted 🎬' : 'Draft saved');
        router.push(`/agency/castings/${casting._id}`);
      }
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.path.split('.')[0], d.message])));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (t && !v.tags.includes(t) && v.tags.length < 10) set('tags', [...v.tags, t]);
    setTagDraft('');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Section icon={Clapperboard} title="The project" description="What are you making?" index={0}>
          <Field label="Casting title" required error={errors.title} hint="Make it punchy — this is the headline artists see.">
            {(id) => <Input id={id} value={v.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Lead girl for coming-of-age OTT drama" />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Project name" required error={errors.projectName}>
              {(id) => <Input id={id} value={v.projectName} onChange={(e) => set('projectName', e.target.value)} placeholder="Pehli Baarish" />}
            </Field>
            <Field label="Project type" required error={errors.projectType}>
              {(id) => <Select id={id} value={v.projectType} onChange={(e) => set('projectType', e.target.value)} options={options.projectTypes} />}
            </Field>
          </div>
          <Field label="Production house">
            {(id) => <Input id={id} value={v.productionHouse} onChange={(e) => set('productionHouse', e.target.value)} placeholder="Monsoon Pictures" />}
          </Field>
          <Field label="Description" required error={errors.description} hint={`${v.description.length}/5000`}>
            {(id) => <Textarea id={id} rows={6} value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="Story, tone, shoot format, what the selection process looks like…" />}
          </Field>
        </Section>

        <Section icon={Sparkles} title="The role" description="Who are you looking for?" index={1}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Role / character name" required error={errors.roleName}>
              {(id) => <Input id={id} value={v.roleName} onChange={(e) => set('roleName', e.target.value)} placeholder="Saanvi" />}
            </Field>
            <Field label="Role type">
              {(id) => <Select id={id} value={v.roleType} onChange={(e) => set('roleType', e.target.value)} options={options.roleTypes} />}
            </Field>
          </div>
          <Field label="Character brief" hint="Personality, arc, look — helps artists self-select.">
            {(id) => <Textarea id={id} rows={4} value={v.characterBrief} onChange={(e) => set('characterBrief', e.target.value)} />}
          </Field>
        </Section>

        <Section icon={ListChecks} title="Requirements" description="These power Smart Match scoring and artist alerts." index={2}>
          <Field label="Gender">
            {() => <ChipSelect options={['Any', ...options.genders]} value={[v.gender]} onChange={(arr) => set('gender', arr.filter((x) => x !== v.gender)[0] ?? v.gender)} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Playing age" error={errors.ageMin}>
              {(id) => (
                <div className="flex items-center gap-2">
                  <Input id={id} type="number" min={0} max={100} value={v.ageMin} onChange={num('ageMin')} placeholder="Min" />
                  <span className="text-muted">–</span>
                  <Input type="number" min={0} max={100} value={v.ageMax} onChange={num('ageMax')} placeholder="Max" />
                </div>
              )}
            </Field>
            <Field label="Height (cm)">
              {(id) => (
                <div className="flex items-center gap-2">
                  <Input id={id} type="number" min={50} max={250} value={v.heightMinCm} onChange={num('heightMinCm')} placeholder="Min" />
                  <span className="text-muted">–</span>
                  <Input type="number" min={50} max={250} value={v.heightMaxCm} onChange={num('heightMaxCm')} placeholder="Max" />
                </div>
              )}
            </Field>
          </div>
          <Field label="Languages" hint="Up to 10">{() => <ChipSelect size="sm" options={options.languages} value={v.languages} onChange={(x) => set('languages', x)} max={10} />}</Field>
          <Field label="Skills" hint="Up to 15">{() => <ChipSelect size="sm" options={options.skills} value={v.skills} onChange={(x) => set('skills', x)} max={15} />}</Field>
          <Field label="Talent categories" hint="Up to 5">{() => <ChipSelect size="sm" options={options.categories} value={v.categories} onChange={(x) => set('categories', x)} max={5} />}</Field>
        </Section>

        <Section icon={Truck} title="Logistics" index={3}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" hint="City, or “Remote / Pan India”">
              {(id) => <Input id={id} list="cities" value={v.location} onChange={(e) => set('location', e.target.value)} placeholder="Mumbai" />}
            </Field>
            <Field label="Application deadline" required error={errors.deadline}>
              {(id) => <Input id={id} type="datetime-local" value={v.deadline} onChange={(e) => set('deadline', e.target.value)} />}
            </Field>
            <Field label="Shoot start">{(id) => <Input id={id} type="date" value={v.shootStart} onChange={(e) => set('shootStart', e.target.value)} />}</Field>
            <Field label="Shoot end">{(id) => <Input id={id} type="date" value={v.shootEnd} onChange={(e) => set('shootEnd', e.target.value)} />}</Field>
            <Field label="Compensation">{(id) => <Input id={id} value={v.compensation} onChange={(e) => set('compensation', e.target.value)} placeholder="₹25,000 / day" />}</Field>
            <div className="flex items-end pb-2"><Switch checked={v.isPaid} onChange={(x) => set('isPaid', x)} label="Paid role" description="Unpaid roles are clearly labelled" /></div>
          </div>
          <datalist id="cities">{options.cities.map((c) => <option key={c} value={c} />)}</datalist>
        </Section>

        <Section icon={FileVideo} title="Self-tape" description="Ask artists to attach a Google Drive audition video." index={4}>
          <Switch checked={v.selfTapeRequired} onChange={(x) => set('selfTapeRequired', x)} label="Self-tape required" description="Artists must share a Drive link when applying" />
          {v.selfTapeRequired && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <Field label="Instructions / sides" hint="Scene text, framing, duration, slate requirements.">
                {(id) => <Textarea id={id} rows={5} value={v.selfTapeInstructions} onChange={(e) => set('selfTapeInstructions', e.target.value)} placeholder="Perform the 90-second monologue below. Natural light, eye level…" />}
              </Field>
            </motion.div>
          )}
        </Section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><ImageIcon className="h-4 w-4" />Cover image</h2>
          <ImageUploader value={v.coverImage} onChange={(url) => set('coverImage', url)} aspect="aspect-video" label="Upload cover" />
        </section>
        <section className="card space-y-4 p-5">
          <Switch checked={v.isUrgent} onChange={(x) => set('isUrgent', x)} label="Mark as urgent ⚡" description="Pinned to the top of artist feeds" />
          <Field label="Tags">
            {(id) => (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input id={id} value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add tag + Enter" className="h-10" />
                  <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {v.tags.map((t) => (
                    <button key={t} type="button" onClick={() => set('tags', v.tags.filter((x) => x !== t))} className="rounded-full border-2 border-ink bg-violet px-2.5 py-0.5 text-xs font-bold text-white" title="Remove">#{t} ×</button>
                  ))}
                </div>
              </div>
            )}
          </Field>
          <Field label="Visibility">
            {() => (
              <div className="grid grid-cols-3 gap-1 rounded-2xl border-2 border-ink p-1 dark:border-line">
                {(['draft', 'open', 'closed'] as CastingStatus[]).map((s) => (
                  <button key={s} type="button" onClick={() => set('status', s)} className={cn('rounded-xl py-2 text-xs font-bold uppercase tracking-wide transition', v.status === s ? 'bg-lime text-ink' : 'text-muted hover:text-fg')}>{s === 'open' ? 'Live' : s}</button>
                ))}
              </div>
            )}
          </Field>
        </section>
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" loading={saving}><Save className="h-4 w-4" />{castingId ? 'Save changes' : v.status === 'open' ? 'Publish casting' : 'Save casting'}</Button>
          {!castingId && v.status === 'open' && (
            <Button variant="outline" onClick={() => submit('draft')} disabled={saving}>Save as draft</Button>
          )}
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </aside>
    </form>
  );
}
