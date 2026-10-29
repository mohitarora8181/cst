'use client';

import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { ChipSelect } from '@/components/ui/chip-select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useOptions } from '@/hooks/use-options';
import { cn } from '@/lib/utils';

export interface TalentFilters {
  q: string;
  gender: string[];
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  city: string[];
  languages: string[];
  skills: string[];
  matchAll: boolean;
  categories: string[];
  experience: string[];
  bodyType: string[];
  skinTone: string[];
  availability: string[];
  verified: boolean;
  hasVideo: boolean;
  minCompleteness: string;
  sort: string;
}

export const EMPTY_FILTERS: TalentFilters = {
  q: '', gender: [], ageMin: '', ageMax: '', heightMin: '', heightMax: '', city: [], languages: [], skills: [], matchAll: false,
  categories: [], experience: [], bodyType: [], skinTone: [], availability: [], verified: false, hasVideo: false, minCompleteness: '', sort: 'recent',
};

const LIST_KEYS = ['gender', 'city', 'languages', 'skills', 'categories', 'experience', 'bodyType', 'skinTone', 'availability'] as const;
const TEXT_KEYS = ['q', 'ageMin', 'ageMax', 'heightMin', 'heightMax', 'minCompleteness', 'sort'] as const;
const BOOL_KEYS = ['matchAll', 'verified', 'hasVideo'] as const;

export function filtersFromSearch(sp: URLSearchParams): TalentFilters {
  const f: TalentFilters = { ...EMPTY_FILTERS };
  for (const k of LIST_KEYS) f[k] = sp.get(k)?.split(',').filter(Boolean) ?? [];
  for (const k of TEXT_KEYS) f[k] = sp.get(k) ?? EMPTY_FILTERS[k];
  for (const k of BOOL_KEYS) f[k] = sp.get(k) === 'true';
  return f;
}

/** Serialises only non-default values (shared by the URL and the API query). */
export function filtersToParams(f: TalentFilters) {
  const out: Record<string, string> = {};
  for (const k of LIST_KEYS) if (f[k].length) out[k] = f[k].join(',');
  for (const k of TEXT_KEYS) if (f[k] && f[k] !== EMPTY_FILTERS[k]) out[k] = f[k];
  for (const k of BOOL_KEYS) if (f[k]) out[k] = 'true';
  return out;
}

export const activeFilterCount = (f: TalentFilters) =>
  Object.keys(filtersToParams({ ...f, sort: EMPTY_FILTERS.sort, q: '' })).length;

function Group({ title, children, defaultOpen = true, count }: { title: string; children: React.ReactNode; defaultOpen?: boolean; count?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-ink/5 py-4 last:border-0 dark:border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          {title}
          {!!count && <span className="rounded-full bg-pink px-1.5 text-[10px] text-white">{count}</span>}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted transition', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Range({ min, max, onMin, onMax, placeholder }: { min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void; placeholder: [string, string] }) {
  return (
    <div className="flex items-center gap-2">
      <Input type="number" value={min} onChange={(e) => onMin(e.target.value)} placeholder={placeholder[0]} className="h-10 px-3" />
      <span className="text-muted">–</span>
      <Input type="number" value={max} onChange={(e) => onMax(e.target.value)} placeholder={placeholder[1]} className="h-10 px-3" />
    </div>
  );
}

export function TalentFilterPanel({ value, onChange }: { value: TalentFilters; onChange: (f: TalentFilters) => void }) {
  const { options } = useOptions();
  const set = <K extends keyof TalentFilters>(k: K, v: TalentFilters[K]) => onChange({ ...value, [k]: v });

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="font-display text-lg font-bold">Filters</p>
        {activeFilterCount(value) > 0 && (
          <button onClick={() => onChange({ ...EMPTY_FILTERS, q: value.q, sort: value.sort })} className="inline-flex items-center gap-1 text-xs font-semibold text-pink hover:underline"><RotateCcw className="h-3 w-3" />Clear all</button>
        )}
      </div>
      <Group title="Gender" count={value.gender.length}><ChipSelect size="sm" options={options.genders} value={value.gender} onChange={(v) => set('gender', v)} /></Group>
      <Group title="Playing age">
        <Range min={value.ageMin} max={value.ageMax} onMin={(v) => set('ageMin', v)} onMax={(v) => set('ageMax', v)} placeholder={['18', '35']} />
      </Group>
      <Group title="Height (cm)">
        <Range min={value.heightMin} max={value.heightMax} onMin={(v) => set('heightMin', v)} onMax={(v) => set('heightMax', v)} placeholder={['150', '190']} />
      </Group>
      <Group title="City" count={value.city.length}><ChipSelect size="sm" options={options.cities} value={value.city} onChange={(v) => set('city', v)} /></Group>
      <Group title="Languages" count={value.languages.length}>
        <ChipSelect size="sm" options={options.languages} value={value.languages} onChange={(v) => set('languages', v)} />
      </Group>
      <Group title="Skills" count={value.skills.length}>
        <ChipSelect size="sm" options={options.skills} value={value.skills} onChange={(v) => set('skills', v)} />
      </Group>
      {(value.languages.length > 1 || value.skills.length > 1) && (
        <div className="py-3"><Switch checked={value.matchAll} onChange={(v) => set('matchAll', v)} label="Match all" description="Require every selected language / skill" /></div>
      )}
      <Group title="Category" count={value.categories.length} defaultOpen={false}><ChipSelect size="sm" options={options.categories} value={value.categories} onChange={(v) => set('categories', v)} /></Group>
      <Group title="Experience" count={value.experience.length} defaultOpen={false}><ChipSelect size="sm" options={options.experienceLevels} value={value.experience} onChange={(v) => set('experience', v)} /></Group>
      <Group title="Body type" count={value.bodyType.length} defaultOpen={false}><ChipSelect size="sm" options={options.bodyTypes} value={value.bodyType} onChange={(v) => set('bodyType', v)} /></Group>
      <Group title="Skin tone" count={value.skinTone.length} defaultOpen={false}><ChipSelect size="sm" options={options.skinTones} value={value.skinTone} onChange={(v) => set('skinTone', v)} /></Group>
      <Group title="Availability" count={value.availability.length} defaultOpen={false}><ChipSelect size="sm" options={options.availability} value={value.availability} onChange={(v) => set('availability', v)} /></Group>
      <Group title="Quality">
        <div className="space-y-4">
          <Switch checked={value.verified} onChange={(v) => set('verified', v)} label="Verified only" />
          <Switch checked={value.hasVideo} onChange={(v) => set('hasVideo', v)} label="Has showreel / video" />
          <div>
            <p className="mb-2 flex justify-between text-sm font-semibold">Min. profile completeness <span className="tabular-nums text-pink">{value.minCompleteness || 0}%</span></p>
            <input type="range" min={0} max={100} step={10} value={value.minCompleteness || 0} onChange={(e) => set('minCompleteness', e.target.value === '0' ? '' : e.target.value)} className="w-full accent-pink" />
          </div>
        </div>
      </Group>
    </div>
  );
}
