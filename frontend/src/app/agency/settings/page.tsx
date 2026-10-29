'use client';

import { KeyRound, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SectionCard } from '@/components/agency/shared';
import { PageHeader } from '@/components/layout/app-shell';
import { ImageUploader } from '@/components/media/image-uploader';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api, ApiError, errorMessage } from '@/lib/api';

export default function AgencySettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setAgencyName(user.agencyName ?? '');
    setAvatar(user.avatar || null);
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/me', { name, agencyName, avatar: avatar ?? '' });
      await refresh();
      toast.success('Account updated');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError('');
    if (pw.newPassword !== pw.confirm) return setPwError('Passwords don’t match');
    setPwSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : errorMessage(err));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Settings" title="Account" description="Your agency identity and sign-in security." />
      <div className="space-y-6">
        <SectionCard title="Profile" icon={<UserRound className="h-5 w-5 text-pink" />}>
          <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
            <ImageUploader value={avatar} onChange={setAvatar} aspect="aspect-square" label="Logo / avatar" />
            <div className="space-y-4">
              <Field label="Your name" required>{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
              <Field label="Agency name" hint="Shown on casting calls you post">{(id) => <Input id={id} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />}</Field>
              <Field label="Email">{(id) => <Input id={id} value={user?.email ?? ''} disabled />}</Field>
              <div className="flex justify-end"><Button onClick={saveProfile} loading={saving} disabled={name.trim().length < 2}><Save className="h-4 w-4" />Save changes</Button></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Password" icon={<KeyRound className="h-5 w-5 text-pink" />}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password">{(id) => <Input id={id} type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />}</Field>
            <Field label="New password" hint="8+ chars, a letter and a number">{(id) => <Input id={id} type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />}</Field>
            <Field label="Confirm new" error={pwError}>{(id) => <Input id={id} type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />}</Field>
          </div>
          <div className="mt-4 flex justify-end"><Button variant="dark" onClick={changePassword} loading={pwSaving} disabled={!pw.currentPassword || !pw.newPassword}>Update password</Button></div>
        </SectionCard>
      </div>
    </div>
  );
}
