import { create } from 'zustand';
import { MenuItem } from '@/types';

interface MenuStore {
  menus: MenuItem[];
  isLoaded: boolean;
  setMenus: (menus: MenuItem[]) => void;
  clearMenus: () => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  menus: [],
  isLoaded: false,
  setMenus: (menus) => set({ menus, isLoaded: true }),
  clearMenus: () => set({ menus: [], isLoaded: false }),
}));