import { Reveal } from '@/components/motion/reveal';

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: React.ReactNode; description?: string; action?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-pink">{eyebrow}</p>}
        <h2 className="max-w-2xl text-4xl font-extrabold leading-[0.95] sm:text-6xl">{title}</h2>
        {description && <p className="mt-4 max-w-xl text-lg text-muted">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}
