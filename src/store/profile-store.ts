import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      isLoaded: false,
      setProfile: (profile) => set({ profile, isLoaded: true }),
      clearProfile: () => set({ profile: null, isLoaded: false }),
    }),
    { name: 'graville_profile' }
  )
);