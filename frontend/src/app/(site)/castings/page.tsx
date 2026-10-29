'use client';

import { Clapperboard, Search, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { CastingCard, CastingCardSkeleton } from '@/components/casting/casting-card';
import { Reveal } from '@/components/motion/reveal';
import { ChipSelect } from '@/components/ui/chip-select';
import { Input, Select } from '@/components/ui/input';
import { EmptyState, Pagination } from '@/components/ui/misc';
import { Switch } from '@/components/ui/switch';
import { useDebounce } from '@/hooks/use-debounce';
import { useOptions } from '@/hooks/use-options';
import { toQuery } from '@/lib/api';
import type { CastingCall, Paginated } from '@/types';

function CastingsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { options } = useOptions();
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState(sp.get('q') ?? '');
  const debouncedQ = useDebounce(q);
  const filters = useMemo(() => ({
    projectType: sp.get('projectType')?.split(',').filter(Boolean) ?? [],
    gender: sp.get('gender') ?? '',
    location: sp.get('location') ?? '',
    paid: sp.get('paid') === 'true',
    urgent: sp.get('urgent') === 'true',
    sort: sp.get('sort') ?? 'recent',
    page: Number(sp.get('page') ?? 1),
  }), [sp]);

  const update = (patch: Record<string, string | string[] | boolean | number | undefined>) => {
    const next = { ...filters, q: debouncedQ, page: 1, ...patch };
    router.replace(`${pathname}${toQuery({ ...next, paid: next.paid || undefined, urgent: next.urgent || undefined, page: next.page > 1 ? next.page : undefined, sort: next.sort !== 'recent' ? next.sort : undefined })}`, { scroll: false });
  };

  useEffect(() => {
    if ((sp.get('q') ?? '') !== debouncedQ) update({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const key = `/castings${toQuery({ q: debouncedQ, projectType: filters.projectType, gender: filters.gender, location: filters.location, paid: filters.paid || undefined, urgent: filters.urgent || undefined, sort: filters.sort, page: filters.page, limit: 12 })}`;
  const { data, isLoading } = useSWR<Paginated<CastingCall>>(key, { keepPreviousData: true });
  const activeCount = filters.projectType.length + Number(!!filters.gender) + Number(!!filters.location) + Number(filters.paid) + Number(filters.urgent);

  return (
    <div className="container py-10">
      <Reveal>
        <p className="eyebrow mb-5"><Clapperboard className="h-3.5 w-3.5" /> Open castings</p>
        <h1 className="text-5xl font-extrabold leading-[0.9] sm:text-7xl">Find your <span className="text-gradient">next role</span></h1>
        <p className="mt-4 max-w-xl text-lg text-muted">Verified briefs for films, OTT, ads, music videos & theatre — sorted by what’s hot.</p>
      </Reveal>

      <div className="sticky top-24 z-30 mt-10 flex flex-col gap-3 rounded-3xl border-2 border-ink bg-surface/90 p-3 shadow-brutal backdrop-blur-xl sm:flex-row dark:border-line">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search role, project, production house…" className="border-transparent pl-12" />
        </div>
        <div className="flex gap-2">
          <div className="w-40"><Select value={filters.sort} onChange={(e) => update({ sort: e.target.value || 'recent' })} options={[{ value: 'recent', label: 'Newest' }, { value: 'deadline', label: 'Closing soon' }, { value: 'popular', label: 'Most applied' }]} placeholder="Sort" /></div>
          <button onClick={() => setShowFilters((s) => !s)} className="relative inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-ink bg-sun px-4 text-sm font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeCount > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-lime">{activeCount}</span>}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card mt-4 grid gap-6 p-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Project type</p>
            <ChipSelect size="sm" options={options.projectTypes} value={filters.projectType} onChange={(v) => update({ projectType: v })} />
          </div>
          <div className="space-y-4">
            <Select value={filters.gender} onChange={(e) => update({ gender: e.target.value })} options={options.genders} placeholder="Any gender" />
            <Input defaultValue={filters.location} onBlur={(e) => update({ location: e.target.value })} placeholder="City (e.g. Mumbai)" />
            <Switch checked={filters.paid} onChange={(v) => update({ paid: v })} label="Paid roles only" />
            <Switch checked={filters.urgent} onChange={(v) => update({ urgent: v })} label="Urgent only" />
            {activeCount > 0 && (
              <button onClick={() => router.replace(pathname)} className="inline-flex items-center gap-1 text-sm font-semibold text-pink"><X className="h-4 w-4" /> Clear filters</button>
            )}
          </div>
        </div>
      )}

      <p className="mb-5 mt-8 text-sm font-semibold text-muted">{data ? `${data.total} role${data.total === 1 ? '' : 's'} open` : 'Loading roles…'}</p>

      {isLoading && !data ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CastingCardSkeleton key={i} />)}</div>
      ) : data?.items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((c, i) => <CastingCard key={c._id} casting={c} index={i} />)}</div>
      ) : (
        <EmptyState icon={<Search />} title="No roles match those filters" description="Try widening your search — new briefs land every day." />
      )}

      <div className="mt-10"><Pagination page={data?.page ?? 1} pages={data?.pages ?? 1} onChange={(p) => update({ page: p })} /></div>
    </div>
  );
}

export default function CastingsPage() {
  return (
    <Suspense>
      <CastingsBrowser />
    </Suspense>
  );
}
