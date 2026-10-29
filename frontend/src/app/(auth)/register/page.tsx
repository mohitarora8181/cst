'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, Drama } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { ApiError, errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

const ROLES: { value: Role; title: string; body: string; icon: typeof Drama; tone: string }[] = [
  { value: 'artist', title: 'I’m an artist', body: 'Actor, model, dancer, voice…', icon: Drama, tone: 'bg-lime' },
  { value: 'agency', title: 'I’m casting', body: 'Agency / production (invite only)', icon: Building2, tone: 'bg-pink' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>('artist');
  const [form, setForm] = useState({ name: '', email: '', password: '', agencyName: '', inviteCode: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await register({ ...form, role });
      toast.success(role === 'artist' ? 'Account created — let’s build your comp card!' : 'Agency account ready');
      router.replace(role === 'artist' ? '/dashboard/profile?welcome=1' : '/agency');
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(Object.fromEntries(err.details.map((d) => [d.path, d.message])));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-extrabold">Join the cast<span className="text-pink">.</span></h1>
      <p className="mt-2 text-muted">Free forever for artists. Takes under a minute.</p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={cn('relative rounded-3xl border-2 p-4 text-left transition', role === r.value ? 'border-ink bg-surface shadow-brutal dark:border-lime' : 'border-line/20 bg-surface/50 opacity-70 hover:opacity-100 dark:border-line')}
          >
            <span className={cn('mb-3 grid h-10 w-10 place-items-center rounded-xl border-2 border-ink text-ink', r.tone)}><r.icon className="h-5 w-5" /></span>
            <p className="font-bold">{r.title}</p>
            <p className="text-xs text-muted">{r.body}</p>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label={role === 'artist' ? 'Full name' : 'Your name'} error={errors.name}>{(id) => <Input id={id} required value={form.name} onChange={set('name')} placeholder="Aanya Kapoor" autoComplete="name" />}</Field>
        <Field label="Email" error={errors.email}>{(id) => <Input id={id} type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />}</Field>
        <Field label="Password" error={errors.password} hint="8+ characters with a letter and a number">{(id) => <Input id={id} type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" />}</Field>
        <AnimatePresence initial={false}>
          {role === 'agency' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
              <Field label="Agency / production name">{(id) => <Input id={id} value={form.agencyName} onChange={set('agencyName')} placeholder="Monsoon Pictures" />}</Field>
              <Field label="Invite code" hint="Agency accounts are invite-only to keep artists safe.">{(id) => <Input id={id} required value={form.inviteCode} onChange={set('inviteCode')} placeholder="XXXX-XXXX" />}</Field>
            </motion.div>
          )}
        </AnimatePresence>
        <Button type="submit" size="lg" loading={busy} className="w-full">Create account <ArrowRight className="h-5 w-5" /></Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="font-bold text-pink hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
