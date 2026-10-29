'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { CastingForm } from '@/components/agency/casting-form';
import { PageHeader } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/misc';
import type { CastingCall } from '@/types';

export default function EditCastingPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useSWR<{ casting: CastingCall }>(`/castings/${id}`);

  if (error) return <p className="text-danger">{error.message}</p>;
  return (
    <div>
      <PageHeader eyebrow="Edit casting" title={data ? data.casting.roleName : 'Loading…'} description={data ? `${data.casting.projectName} · ${data.casting.projectType}` : undefined} />
      {data ? <CastingForm key={data.casting._id} initial={data.casting} castingId={data.casting._id} /> : <Skeleton className="h-[60vh] rounded-3xl" />}
    </div>
  );
}
