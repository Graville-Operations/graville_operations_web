import { create } from 'zustand';
import { MenuItem } from '@/types/menu';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';

interface MenuStore {
  menus: MenuItem[];
  isLoaded: boolean;
  setMenus: (menus: MenuItem[]) => void;
  clearMenus: () => void;
}

// The sidebar tree lives in the shared cache (lib/api/cache.ts) — fetchSidebarMenus()
// fills ENTITY_CACHE_KEYS.sidebarMenus. Start from it so a reload restores the sidebar
// instantly; this store no longer keeps a second, persisted copy of its own.
const cachedMenus = readEntityCache<MenuItem[]>(ENTITY_CACHE_KEYS.sidebarMenus);

export const useMenuStore = create<MenuStore>()((set) => ({
  menus: cachedMenus ?? [],
  isLoaded: cachedMenus !== null,
  setMenus: (menus) => set({ menus, isLoaded: true }),
  clearMenus: () => set({ menus: [], isLoaded: false }),
}));