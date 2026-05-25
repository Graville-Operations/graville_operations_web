import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@/types';

interface MenuStore {
  menus: MenuItem[];
  isLoaded: boolean;
  setMenus: (menus: MenuItem[]) => void;
  clearMenus: () => void;
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      menus: [],
      isLoaded: false,
      setMenus: (menus) => set({ menus, isLoaded: true }),
      clearMenus: () => set({ menus: [], isLoaded: false }),
    }),
    {
      name: 'graville_menus',
    }
  )
);