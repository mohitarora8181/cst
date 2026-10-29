import { ArrowRight, Clapperboard, Users } from 'lucide-react';
import { ArtistCard } from '@/components/artist/artist-card';
import { CastingCard } from '@/components/casting/casting-card';
import { BannerCarousel } from '@/components/home/banner-carousel';
import { Features, HowItWorks } from '@/components/home/features';
import { Hero } from '@/components/home/hero';
import { Marquee } from '@/components/home/marquee';
import { ReleasesRail } from '@/components/home/releases-rail';
import { SectionHeading } from '@/components/home/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { serverGet } from '@/lib/server-api';
import type { HomeData } from '@/types';

export const revalidate = 30;

const FALLBACK: HomeData = {
  hero: {
    eyebrow: 'India’s boldest casting network',
    title: 'Get cast.',
    highlight: 'Not lost.',
    subtitle: 'Build a profile casting directors actually want to open, apply to verified auditions, and track every callback in one place.',
    primaryCta: { label: 'Create artist profile', href: '/register' },
    secondaryCta: { label: 'Browse castings', href: '/castings' },
    images: [],
    stats: [],
  },
  marquee: ['Feature Films', 'Web Series', 'Ad Films', 'Music Videos', 'Theatre'],
  banners: [],
  releases: [],
  featured: [],
  castings: [],
  live: { artists: 0, openCastings: 0, selections: 0 },
};

export default async function HomePage() {
  const data = (await serverGet<HomeData>('/cms/home')) ?? FALLBACK;

  return (
    <>
      <Hero hero={data.hero} live={data.live} />
      <div className="-rotate-1 scale-[1.02]">
        <Marquee items={data.marquee} />
      </div>

      <BannerCarousel banners={data.banners} />

      <section className="container py-16">
        <SectionHeading
          eyebrow="Now casting"
          title={<>Roles waiting <span className="text-gradient">for you</span></>}
          description="Fresh briefs from production houses across India. Sign in to see your Smart Match score on every role."
          action={<ButtonLink href="/castings" variant="outline">All castings <ArrowRight className="h-4 w-4" /></ButtonLink>}
        />
        {data.castings.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.castings.map((c, i) => <CastingCard key={c._id} casting={c} index={i} />)}
          </div>
        ) : (
          <EmptyState icon={<Clapperboard />} title="No open castings right now" description="New roles drop every week — create your profile to get alerts." />
        )}
      </section>

      {data.featured.length > 0 && (
        <section id="artists" className="relative overflow-hidden border-y-2 border-ink bg-surface-2/50 py-20 dark:border-line">
          <div className="container">
            <SectionHeading
              eyebrow="Fresh faces"
              title={<>Featured <span className="italic text-pink">talent</span></>}
              description="Hand-picked by our casting team this week."
              action={<ButtonLink href="/register" variant="pink"><Users className="h-4 w-4" /> Get featured</ButtonLink>}
            />
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {data.featured.map((a, i) => <ArtistCard key={a._id} artist={a} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <section className="container py-20">
        <SectionHeading eyebrow="Why CastLab" title={<>Built for the <span className="text-gradient">audition grind</span></>} description="Everything a working artist and a busy casting team need — nothing they don’t." />
        <Features />
      </section>

      {data.releases.length > 0 && (
        <section id="releases" className="container py-16">
          <SectionHeading eyebrow="Recent releases" title={<>Cast on CastLab, <br className="hidden sm:block" />now <span className="italic text-pink">streaming</span></>} />
          <ReleasesRail releases={data.releases} />
        </section>
      )}

      <section id="how" className="container py-20">
        <SectionHeading eyebrow="How it works" title="Three steps to your next set" />
        <HowItWorks />
      </section>

      <section className="container py-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border-2 border-ink bg-violet p-10 text-white shadow-brutal-lg sm:p-16 dark:border-line">
            <div aria-hidden className="absolute -right-20 -top-20 h-80 w-80 animate-blob rounded-full bg-pink/60 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 left-10 h-72 w-72 animate-blob rounded-full bg-lime/40 blur-3xl [animation-delay:-5s]" />
            <div className="relative max-w-2xl">
              <h2 className="text-5xl font-extrabold leading-[0.95] sm:text-7xl">Your close-up is one profile away.</h2>
              <p className="mt-5 text-lg text-white/80">Join {data.live.artists > 0 ? `${data.live.artists.toLocaleString('en-IN')}+` : 'thousands of'} artists getting discovered by casting teams every day. Free, forever.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/register" size="lg">Create my profile <ArrowRight className="h-5 w-5" /></ButtonLink>
                <ButtonLink href="/castings" size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10">See open roles</ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
      <Marquee items={['Lights', 'Camera', 'Apply', 'Audition', 'Callback', 'Wrap']} tone="ink" reverse className="mt-16" />
    </>
  );
}
