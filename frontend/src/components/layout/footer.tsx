import Link from 'next/link';
import { Logo } from './logo';

const COLS = [
  { title: 'Artists', links: [['Create profile', '/register'], ['Browse castings', '/castings'], ['Artist dashboard', '/dashboard'], ['Self-tape tips', '/castings']] },
  { title: 'Agencies', links: [['Agency login', '/login'], ['Post a casting', '/agency/castings/new'], ['Talent search', '/agency/talent'], ['Shortlist boards', '/agency/boards']] },
  { title: 'Company', links: [['About', '/#how'], ['Recent releases', '/#releases'], ['Safety', '/#safety'], ['Contact', 'mailto:hello@castlab.dev']] },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t-2 border-ink bg-ink text-white dark:border-line">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo className="[&>span:last-child]:text-white" />
          <p className="max-w-xs text-sm text-white/60">The casting network for Indian film, OTT, ads & theatre. Real auditions, verified agencies, zero middlemen fees.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-lime">{c.title}</p>
            <ul className="space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm text-white/70 transition hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="pointer-events-none select-none overflow-hidden whitespace-nowrap font-display text-[18vw] font-extrabold leading-[0.8] tracking-tighter text-white/[0.04]">
        CASTLAB CASTLAB
      </div>
      <div className="container flex flex-col items-center justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <p>© {new Date().getFullYear()} CastLab. Made for storytellers. Made by <a href="https://mohit8181.me/" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">Software Developer</a></p>
        <p>Lights. Camera. Apply.</p>
      </div>
    </footer>
  );
}
