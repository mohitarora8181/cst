'use client';

import Link from 'next/link';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-lime text-ink border-2 border-ink shadow-brutal hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  pink: 'bg-pink text-white border-2 border-ink shadow-brutal hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  dark: 'bg-fg text-bg border-2 border-fg hover:bg-fg/90',
  outline: 'border-2 border-ink dark:border-line bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white border-2 border-ink hover:bg-danger/90',
} as const;

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-14 px-7 text-base gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

const base = 'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 select-none';

export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) =>
  cn(base, VARIANTS[variant], SIZES[size], className);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, type = 'button', ...props },
  ref
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
