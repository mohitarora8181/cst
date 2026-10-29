'use client';

/* eslint-disable @next/next/no-img-element */
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** <img> with a lazy fade-in and a branded fallback when the URL is missing or broken. */
export function SmartImage({ src, alt, className, imgClassName }: { src?: string | null; alt: string; className?: string; imgClassName?: string }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');
  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {state !== 'error' && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn('h-full w-full object-cover transition duration-700', state === 'loaded' ? 'scale-100 opacity-100' : 'scale-105 opacity-0', imgClassName)}
        />
      )}
      {state === 'loading' && <div className="skeleton absolute inset-0 rounded-none" />}
      {state === 'error' && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-violet/40 via-pink/30 to-sun/40 text-ink/60">
          <ImageOff className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
