import type { Metadata } from 'next';
import { serverGet } from '@/lib/server-api';
import type { ArtistProfile } from '@/types';
import { ArtistPublicProfile } from './artist-profile';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverGet<{ profile: ArtistProfile }>(`/profiles/${slug}`, { revalidate: 120 });
  if (!data) return { title: 'Artist' };
  const p = data.profile;
  return {
    title: `${p.stageName} — ${p.categories?.join(', ') || 'Artist'}`,
    description: p.headline || p.bio?.slice(0, 150),
    openGraph: { images: p.headshot ? [p.headshot] : [] },
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArtistPublicProfile slug={slug} />;
}
