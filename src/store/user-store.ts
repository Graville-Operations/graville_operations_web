import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiUser {
  ref_id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  nationalId?: string;
  accountStatus?: string;
  role?: string;
}

interface UserStore {
  users: ApiUser[];
  isLoaded: boolean;
  setUsers: (users: ApiUser[]) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      users: [],
      isLoaded: false,
      setUsers: (users) => set({ users, isLoaded: true }),
      clearUsers: () => set({ users: [], isLoaded: false }),
    }),
    { name: 'graville_users' }
  )
);