import { cn, PIPELINE, STATUS_META } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';

export function StatusPill({ status, className }: { status: ApplicationStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold', meta.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

/** Horizontal progress tracker: Applied → Shortlisted → Audition → Selected. */
export function StatusTracker({ status }: { status: ApplicationStatus }) {
  const steps = PIPELINE.filter((s) => s !== 'rejected');
  const rejected = status === 'rejected';
  const current = rejected ? -1 : steps.indexOf(status);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1.5">
          <div className={cn('h-1.5 rounded-full transition-colors duration-500', rejected ? 'bg-danger/30' : i <= current ? STATUS_META[s].dot : 'bg-surface-2')} />
          <span className={cn('text-[10px] font-bold uppercase tracking-wider', !rejected && i <= current ? 'text-fg' : 'text-muted/60')}>{STATUS_META[s].label}</span>
        </div>
      ))}
    </div>
  );
}
