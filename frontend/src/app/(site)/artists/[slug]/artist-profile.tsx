'use client';

import useSWR from 'swr';
import { CompCard } from '@/components/artist/comp-card';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import type { ArtistProfile } from '@/types';

/** Fetched client-side so the viewer's session decides whether contact details are revealed. */
export function ArtistPublicProfile({ slug }: { slug: string }) {
  const { data, error } = useSWR<{ profile: ArtistProfile; canContact: boolean }>(`/profiles/${slug}`);
  if (error) {
    return <div className="container py-20"><EmptyState title="Profile not found" description="This artist may have made their profile private." action={<ButtonLink href="/">Back home</ButtonLink>} /></div>;
  }
  if (!data) {
    return (
      <div className="container grid gap-8 py-10 lg:grid-cols-[420px_1fr]">
        <Skeleton className="aspect-[4/5] rounded-3xl" />
        <div className="space-y-4"><Skeleton className="h-20 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-40" /></div>
      </div>
    );
  }
  return <CompCard profile={data.profile} canContact={data.canContact} />;
}
