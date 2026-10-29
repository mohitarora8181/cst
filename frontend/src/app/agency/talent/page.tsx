'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkPlus, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AddToBoardModal } from '@/components/agency/add-to-board-modal';
import { TalentTile } from '@/components/agency/shared';
import {
  activeFilterCount, EMPTY_FILTERS, filtersFromSearch, filtersToParams, TalentFilterPanel, type TalentFilters,
} from '@/components/agency/talent-filters';
import { PageHeader } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { EmptyState, Pagination, Skeleton } from '@/components/ui/misc';
import { useDebounce } from '@/hooks/use-debounce';
import { errorMessage, toQuery } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ArtistProfile, Paginated } from '@/types';

const SORTS = [
  { value: 'recent', label: 'Newest first' },
  { value: 'completeness', label: 'Most complete' },
  { value: 'views', label: 'Most viewed' },
  { value: 'name', label: 'Name A–Z' },
];

export default function TalentSearchPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[70vh] rounded-3xl" />}>
      <TalentSearch />
    </Suspense>
  );
}

function TalentSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TalentFilters>(() => filtersFromSearch(new URLSearchParams(searchParams.toString())));
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [boardFor, setBoardFor] = useState<ArtistProfile | null>(null);

  const debounced = useDebounce(filters, 350);
  const params = useMemo(() => filtersToParams(debounced), [debounced]);

  // Keep the URL shareable — filters live in the query string.
  useEffect(() => {
    const qs = toQuery({ ...params, page: page > 1 ? page : undefined });
    router.replace(`${pathname}${qs}`, { scroll: false });
  }, [params, page, pathname, router]);

  const update = (f: TalentFilters) => { setFilters(f); setPage(1); };

  const { data, error, isLoading } = useSWR<Paginated<ArtistProfile>>(`/talent${toQuery({ ...params, page, limit: 24 })}`, { keepPreviousData: true });
  const active = activeFilterCount(filters);

  return (
    <div>
      <PageHeader eyebrow="Talent search" title={<>Find your <span className="text-gradient">perfect face</span></>} description="Filter the whole roster by look, craft and availability. Filters are saved in the URL — share searches with your team." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input value={filters.q} onChange={(e) => update({ ...filters, q: e.target.value })} placeholder="Search by name, headline, city or skill…" className="h-14 pl-12 text-base" />
        </div>
        <div className="flex gap-2">
          <div className="w-48"><Select value={filters.sort} onChange={(e) => update({ ...filters, sort: e.target.value || 'recent' })} options={SORTS} placeholder="Sort" className="h-14" /></div>
          <Button variant="outline" size="lg" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />Filters{active > 0 && <span className="rounded-full bg-pink px-1.5 text-xs text-white">{active}</span>}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5 scrollbar-none">
            <TalentFilterPanel value={filters} onChange={update} />
          </div>
        </aside>

        <section>
          <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">{error ? <span className="font-semibold text-danger">{errorMessage(error)}</span> : data ? <><b className="text-fg">{data.total}</b> artist{data.total === 1 ? '' : 's'} found</> : 'Searching…'}</p>
            {active > 0 && (
              <button onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })} className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-sun px-3 py-1 text-xs font-bold text-ink"><X className="h-3 w-3" />Clear {active} filter{active > 1 ? 's' : ''}</button>
            )}
          </div>
          {error ? (
            <EmptyState icon={<X />} title="Check your filters" description={errorMessage(error)} action={<Button size="sm" onClick={() => update(EMPTY_FILTERS)}>Reset search</Button>} />
          ) : isLoading && !data ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/5] rounded-3xl" />)}</div>
          ) : !data?.items.length ? (
            <EmptyState icon={<Users />} title="No artists match" description="Try widening the age range or removing a filter or two." action={<Button size="sm" onClick={() => update(EMPTY_FILTERS)}>Reset search</Button>} />
          ) : (
            <>
              <motion.div layout className={cn('grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4', isLoading && 'opacity-60')}>
                <AnimatePresence mode="popLayout">
                  {data.items.map((p) => (
                    <TalentTile
                      key={p._id}
                      profile={p}
                      footer={
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"><div className={cn('h-full rounded-full', p.completeness >= 80 ? 'bg-lime' : p.completeness >= 50 ? 'bg-sun' : 'bg-pink')} style={{ width: `${p.completeness}%` }} /></div>
                          <span className="text-[10px] font-bold tabular-nums text-muted">{p.completeness}%</span>
                        </div>
                      }
                      actions={<Button size="sm" variant="outline" className="w-full" onClick={() => setBoardFor(p)}><BookmarkPlus className="h-4 w-4" />Shortlist</Button>}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              <div className="mt-8"><Pagination page={data.page} pages={data.pages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></div>
            </>
          )}
        </section>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div className="fixed inset-x-0 bottom-0 z-[61] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t-2 border-ink bg-surface p-5 lg:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}>
              <TalentFilterPanel value={filters} onChange={update} />
              <Button className="mt-4 w-full" onClick={() => setMobileOpen(false)}>Show {data?.total ?? ''} results</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddToBoardModal open={Boolean(boardFor)} onClose={() => setBoardFor(null)} profileId={boardFor?._id ?? null} artistName={boardFor?.stageName} />
    </div>
  );
}
