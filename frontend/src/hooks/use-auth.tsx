'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { api, ApiError, fetcher } from '@/lib/api';
import type { ArtistProfile, Role, User } from '@/types';

type ProfileSummary = Pick<ArtistProfile, 'slug' | 'stageName' | 'headshot' | 'completeness' | 'availability' | 'isVerified'> | null;

interface Session { user: User; profile?: ProfileSummary }

interface AuthContextValue {
  user: User | null;
  profile: ProfileSummary;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  register: (data: { name: string; email: string; password: string; role: Role; agencyName?: string; inviteCode?: string }) => Promise<Session>;
  logout: () => Promise<void>;
  refresh: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, mutate } = useSWR<Session | null>(
    '/auth/me',
    (key: string) => fetcher<Session>(key).catch((err) => (err instanceof ApiError && err.status === 401 ? null : Promise.reject(err))),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.post<Session>('/auth/login', { email, password });
    await mutate(session, { revalidate: false });
    return session;
  }, [mutate]);

  const register = useCallback<AuthContextValue['register']>(async (payload) => {
    const session = await api.post<Session>('/auth/register', payload);
    await mutate(session, { revalidate: false });
    return session;
  }, [mutate]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    await mutate(null, { revalidate: false });
  }, [mutate]);

  const value = useMemo<AuthContextValue>(() => ({
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading,
    login,
    register,
    logout,
    refresh: () => mutate(),
  }), [data, isLoading, login, register, logout, mutate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export const homeFor = (role?: Role) => (role === 'agency' ? '/agency' : '/dashboard');
