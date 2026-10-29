import type { Metadata } from 'next';
import { serverGet } from '@/lib/server-api';
import type { CastingCall } from '@/types';
import { CastingDetail } from './casting-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await serverGet<{ casting: CastingCall }>(`/castings/${id}`, { revalidate: 60 });
  if (!data) return { title: 'Casting call' };
  const c = data.casting;
  return {
    title: `${c.roleName} — ${c.projectName}`,
    description: c.title,
    openGraph: { title: `Casting: ${c.roleName} in ${c.projectName}`, description: c.title, images: c.coverImage ? [c.coverImage] : [] },
  };
}

export default async function CastingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CastingDetail id={id} />;
}
