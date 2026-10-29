'use client';

import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-2xl border-2 border-ink/80 dark:border-line bg-surface px-4 text-sm text-fg placeholder:text-muted/70 transition focus:border-pink focus:outline-none focus:ring-4 focus:ring-pink/15 disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, 'h-12', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...props },
  ref
) {
  return <textarea ref={ref} rows={rows} className={cn(fieldBase, 'resize-y py-3 leading-relaxed', className)} {...props} />;
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: (string | { value: string; label: string })[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, placeholder = 'Select…', className, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(fieldBase, 'h-12 appearance-none pr-10', className)} {...props}>
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const { value, label } = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
});

interface FieldProps {
  label?: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string) => React.ReactNode;
}

/** Label + control + hint/error, with a generated id wired to the control. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-muted">
          {label} {required && <span className="text-pink">*</span>}
        </label>
      )}
      {children(id)}
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : hint ? <div className="text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
