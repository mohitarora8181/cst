import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-stroke font-display text-[10rem] font-extrabold leading-none sm:text-[14rem]">404</p>
        <h1 className="-mt-6 text-4xl font-extrabold">Cut! Wrong set.</h1>
        <p className="mt-3 text-muted">The page you’re looking for didn’t make the final edit.</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-2xl border-2 border-ink bg-lime px-6 font-bold text-ink shadow-brutal">Back to the lobby</Link>
      </div>
    </div>
  );
}
