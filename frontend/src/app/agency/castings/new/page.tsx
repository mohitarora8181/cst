'use client';

import { CastingForm } from '@/components/agency/casting-form';
import { PageHeader } from '@/components/layout/app-shell';

export default function NewCastingPage() {
  return (
    <div>
      <PageHeader eyebrow="New casting" title={<>Post a <span className="text-gradient">casting call</span></>} description="Great briefs get better tapes. Be specific about the character, the look and the logistics." />
      <CastingForm />
    </div>
  );
}
