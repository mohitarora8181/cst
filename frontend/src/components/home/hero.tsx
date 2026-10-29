'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { SmartImage } from '@/components/media/smart-image';
import { CountUp } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import type { Hero as HeroData } from '@/types';

const CARD_LAYOUT = [
  { className: 'left-[2%] top-[6%] w-[46%]', rotate: -8, depth: 30, tape: 'bg-lime' },
  { className: 'right-[2%] top-[0%] w-[42%]', rotate: 6, depth: 50, tape: 'bg-pink' },
  { className: 'left-[14%] bottom-[2%] w-[40%]', rotate: 4, depth: 40, tape: 'bg-sun' },
  { className: 'right-[8%] bottom-[8%] w-[38%]', rotate: -5, depth: 20, tape: 'bg-sky' },
];

function Headline({ title, highlight }: { title: string; highlight?: string }) {
  const words = title.split(' ');
  return (
    <h1 className="font-display text-[clamp(3.2rem,9vw,7.5rem)] font-extrabold leading-[0.88] tracking-tighter">
      {words.map((w, i) => (
        <motion.span key={`${w}${i}`} className="mr-[0.22em] inline-block" initial={{ y: '110%', opacity: 0, rotate: 6 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.1 + i * 0.08, type: 'spring', bounce: 0.35, duration: 0.9 }}>
          {w}
        </motion.span>
      ))}
      {highlight && (
        <motion.span className="relative block w-fit" initial={{ opacity: 0, scale: 0.8, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ delay: 0.15 + words.length * 0.08, type: 'spring', bounce: 0.5 }}>
          <span className="relative z-10 text-gradient">{highlight}</span>
          <motion.svg viewBox="0 0 300 20" className="absolute -bottom-2 left-0 z-0 h-5 w-full text-lime" preserveAspectRatio="none" aria-hidden>
            <motion.path d="M2 14 C 60 2, 120 22, 180 10 S 280 4, 298 12" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 + words.length * 0.08, duration: 0.8 }} />
          </motion.svg>
        </motion.span>
      )}
    </h1>
  );
}

export function Hero({ hero, live }: { hero: HeroData; live?: { artists: number; openCastings: number } }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const images = hero.images?.length ? hero.images : [];

  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pt-14" onMouseMove={onMove}>
      {/* background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-[420px] w-[420px] animate-blob rounded-full bg-violet/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] animate-blob rounded-full bg-pink/25 blur-3xl [animation-delay:-4s]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] animate-blob rounded-full bg-lime/20 blur-3xl [animation-delay:-8s]" />
        <div className="dotted-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="container grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          {hero.eyebrow && (
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-6">
              <Sparkles className="h-3.5 w-3.5" /> {hero.eyebrow}
            </motion.span>
          )}
          <Headline title={hero.title} highlight={hero.highlight} />
          {hero.subtitle && (
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 max-w-xl text-lg text-muted sm:text-xl">
              {hero.subtitle}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mt-9 flex flex-wrap gap-3">
            {hero.primaryCta?.label && (
              <ButtonLink href={hero.primaryCta.href || '/register'} size="lg">
                {hero.primaryCta.label} <ArrowRight className="h-5 w-5" />
              </ButtonLink>
            )}
            {hero.secondaryCta?.label && (
              <ButtonLink href={hero.secondaryCta.href || '/castings'} size="lg" variant="outline">
                <Play className="h-4 w-4 fill-current" /> {hero.secondaryCta.label}
              </ButtonLink>
            )}
          </motion.div>

          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
            {hero.stats?.map((s) => (
              <div key={s.label}>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted">{s.label}</dt>
                <dd className="font-display text-4xl font-extrabold"><CountUp value={s.value} /></dd>
              </div>
            ))}
            {live && live.openCastings > 0 && (
              <div className="self-end">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-surface px-3 py-1.5 text-sm font-bold shadow-brutal-sm dark:border-line">
                  <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" /></span>
                  {live.openCastings} castings live now
                </span>
              </div>
            )}
          </motion.dl>
        </div>

        {/* floating polaroids */}
        <div className="relative mx-auto aspect-square w-full max-w-[560px]">
          <motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-fg/20" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} />
          {images.slice(0, 4).map((src, i) => {
            const L = CARD_LAYOUT[i];
            return <FloatingCard key={src + i} src={src} layout={L} index={i} sx={sx} sy={sy} />;
          })}
          <motion.div
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.1, type: 'spring', bounce: 0.5 }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative grid h-32 w-32 place-items-center rounded-full border-2 border-ink bg-lime text-ink shadow-brutal">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden>
                <defs><path id="circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" /></defs>
                <text className="fill-ink text-[10.5px] font-bold uppercase tracking-[0.2em]"><textPath href="#circle">Now casting • Now casting • </textPath></text>
              </svg>
              <Play className="h-8 w-8 translate-x-0.5 fill-current" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ src, layout, index, sx, sy }: { src: string; layout: (typeof CARD_LAYOUT)[number]; index: number; sx: ReturnType<typeof useSpring>; sy: ReturnType<typeof useSpring> }) {
  const x = useTransform(sx, (v: number) => v * layout.depth);
  const y = useTransform(sy, (v: number) => v * layout.depth);
  return (
    <motion.div
      className={`absolute ${layout.className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: layout.rotate }}
      transition={{ delay: 0.35 + index * 0.12, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
    >
      <div className="animate-float" style={{ animationDelay: `${index * -1.5}s` }}>
        <span className={`absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 -rotate-3 ${layout.tape} border border-ink/20`} />
        <div className="rounded-2xl border-2 border-ink bg-surface p-2 pb-6 shadow-brutal-lg dark:border-line">
          <SmartImage src={src} alt="" className="aspect-[4/5] rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}
