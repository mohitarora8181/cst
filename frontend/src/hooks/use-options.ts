'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { Options } from '@/types';

const EMPTY: Options = {
  genders: [], categories: [], experienceLevels: [], languages: [], skills: [], bodyTypes: [], skinTones: [],
  eyeColors: [], hairColors: [], availability: [], projectTypes: [], roleTypes: [], creditTypes: [], videoTypes: [],
  castingStatus: [], applicationStatus: [], auditionModes: [], releaseTypes: [], cities: [],
};

/** Enumerations served by the API (single source of truth for dropdowns & filters). */
export function useOptions() {
  const { data } = useSWR<{ options: Options; features: { imageUpload: boolean } }>('/meta/options', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  });
  return { options: data?.options ?? EMPTY, features: data?.features ?? { imageUpload: false }, ready: Boolean(data) };
}
