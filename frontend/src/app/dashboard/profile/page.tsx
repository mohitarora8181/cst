'use client';

import { ExternalLink, PartyPopper } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import useSWR from 'swr';
import { ProfileEditor } from '@/components/artist/profile-editor';
import { PageHeader } from '@/components/layout/app-shell';
import { ButtonLink } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/misc';
import type { ArtistProfile, ChecklistItem } from '@/types';

type ProfileResponse = { profile: ArtistProfile; checklist: ChecklistItem[] };

function ProfileContent() {
  const sp = useSearchParams();
  const { data, mutate } = useSWR<ProfileResponse>('/profiles/me');

  return (
    <>
      <PageHeader
        eyebrow="Your comp card"
        title="Edit profile"
        description="A complete profile ranks higher in casting searches and Smart Match."
        actions={data && <ButtonLink href={`/artists/${data.profile.slug}`} target="_blank" variant="outline" size="sm">View public card <ExternalLink className="h-4 w-4" /></ButtonLink>}
      />
      {sp.get('welcome') && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-ink bg-lime p-4 text-ink shadow-brutal">
          <PartyPopper className="h-6 w-6 shrink-0" />
          <p className="text-sm font-semibold">Welcome to CastLab! Add a headshot, your basics and 3 photos to start applying — it takes about 5 minutes.</p>
        </div>
      )}
      {data ? (
        <ProfileEditor profile={data.profile} checklist={data.checklist} onSaved={(res) => mutate(res, { revalidate: false })} />
      ) : (
        <div className="space-y-6"><Skeleton className="h-72" /><Skeleton className="h-56" /></div>
      )}
    </>
  );
}

export default function ProfilePage() {
  return <Suspense><ProfileContent /></Suspense>;
}
