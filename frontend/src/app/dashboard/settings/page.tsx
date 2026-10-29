'use client';

import { KeyRound, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api, errorMessage } from '@/lib/api';

export default function ArtistSettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState<'name' | 'pw' | null>(null);

  useEffect(() => { if (user) setName(user.name); }, [user]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('name');
    try {
      await api.patch('/auth/me', { name });
      await refresh();
      toast.success('Account updated');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const savePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('New passwords don’t match');
    setBusy('pw');
    try {
      await api.post('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Settings" title="Account" description="Manage your login details. Profile details live under My profile." />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <form onSubmit={saveName} className="card space-y-5 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><UserRound className="h-5 w-5 text-pink" /> Account</h2>
          <Field label="Account name">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />}</Field>
          <Field label="Email" hint="Contact support to change your email">{(id) => <Input id={id} value={user?.email ?? ''} disabled />}</Field>
          <Button type="submit" loading={busy === 'name'}>Save</Button>
        </form>
        <form onSubmit={savePw} className="card space-y-5 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><KeyRound className="h-5 w-5 text-pink" /> Password</h2>
          <Field label="Current password">{(id) => <Input id={id} type="password" autoComplete="current-password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />}</Field>
          <Field label="New password" hint="8+ characters with a letter and a number">{(id) => <Input id={id} type="password" autoComplete="new-password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />}</Field>
          <Field label="Confirm new password">{(id) => <Input id={id} type="password" autoComplete="new-password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />}</Field>
          <Button type="submit" variant="pink" loading={busy === 'pw'}>Change password</Button>
        </form>
      </div>
    </>
  );
}
