'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { homeFor, useAuth } from '@/hooks/use-auth';
import { errorMessage } from '@/lib/api';

/** Only allow same-site relative redirects. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user } = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      router.replace(safeNext(sp.get('next')) ?? homeFor(user.role));
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-extrabold">Welcome back<span className="text-pink">.</span></h1>
      <p className="mt-2 text-muted">Sign in to track your auditions or manage your castings.</p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Field label="Email">{(id) => <Input id={id} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />}</Field>
        <Field label="Password">
          {(id) => (
            <div className="relative">
              <Input id={id} type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-12" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-fg" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        </Field>
        <Button type="submit" size="lg" loading={busy} className="w-full">Sign in <ArrowRight className="h-5 w-5" /></Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to CastLab? <Link href="/register" className="font-bold text-pink hover:underline">Create a free account</Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
