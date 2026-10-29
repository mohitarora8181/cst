'use client';

import { ExternalLink, Film, GalleryHorizontalEnd, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { BannersEditor, ReleasesEditor } from '@/components/agency/cms-collections';
import { HeroEditor } from '@/components/agency/cms-hero-editor';
import { PageHeader } from '@/components/layout/app-shell';
import { buttonClass } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';

type Section = 'hero' | 'banners' | 'releases';

export default function CmsPage() {
  const [section, setSection] = useState<Section>('hero');
  return (
    <div>
      <PageHeader
        eyebrow="Site CMS"
        title={<>Homepage <span className="text-gradient">control room</span></>}
        description="Everything on the public homepage — hero, banners and recent releases — is managed here. Changes go live within ~30 seconds."
        actions={<a href="/" target="_blank" rel="noreferrer" className={buttonClass('outline', 'md')}><ExternalLink className="h-4 w-4" />View site</a>}
      />
      <Tabs
        className="mb-6"
        value={section}
        onChange={setSection}
        items={[
          { value: 'hero' as Section, label: 'Hero', icon: <Sparkles className="h-4 w-4" /> },
          { value: 'banners' as Section, label: 'Banners', icon: <GalleryHorizontalEnd className="h-4 w-4" /> },
          { value: 'releases' as Section, label: 'Recent releases', icon: <Film className="h-4 w-4" /> },
        ]}
      />
      {section === 'hero' && <HeroEditor />}
      {section === 'banners' && <BannersEditor />}
      {section === 'releases' && <ReleasesEditor />}
    </div>
  );
}
