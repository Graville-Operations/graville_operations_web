import { create } from 'zustand';
import {
  ENTITY_CACHE_KEYS,
  readEntityCache,
  writeEntityCache,
  clearEntityCache,
} from '@/lib/api/cache';

export interface ProfileData {
  ref_id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  role?: string;
  accountStatus?: string;
}

interface ProfileStore {
  profile: ProfileData | null;
  isLoaded: boolean;
  setProfile: (profile: ProfileData) => void;
  clearProfile: () => void;
}

// Persisted through the shared cache (lib/api/cache.ts), under ENTITY_CACHE_KEYS.profile,
// rather than a zustand `persist` middleware of its own.
const cachedProfile = readEntityCache<ProfileData>(ENTITY_CACHE_KEYS.profile);

export const useProfileStore = create<ProfileStore>()((set) => ({
  profile: cachedProfile,
  isLoaded: cachedProfile !== null,
  setProfile: (profile) => {
    writeEntityCache(ENTITY_CACHE_KEYS.profile, profile);
    set({ profile, isLoaded: true });
  },
  clearProfile: () => {
    clearEntityCache(ENTITY_CACHE_KEYS.profile);
    set({ profile: null, isLoaded: false });
  },
}));