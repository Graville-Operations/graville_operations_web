import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import { Menu, MenuDTO, MenuPayload } from '@/types/menu';
import { normaliseMenus } from '@/lib/mappers/menu-mappers';
import { ENTITY_CACHE_KEYS, fetchWithCache, clearEntityCache } from '@/lib/api/cache';

export const menusService = {
  async list(): Promise<Menu[]> {
    return fetchWithCache(ENTITY_CACHE_KEYS.menus, async () => {
      const { data } = await api.get(API.menus.list);
      return normaliseMenus(unwrapArray<MenuDTO>(data));
    });
  },
  async createMenu(body: MenuPayload) {
    const res = await api.post(API.menus.create, body);
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
  async updateMenu(id: number, body: MenuPayload) {
    const res = await api.patch(API.menus.update(id), body);
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
  async deleteMenu(id: number) {
    const res = await api.delete(API.menus.delete(id));
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },

  async createSubmenu(menuId: number, body: MenuPayload) {
    const res = await api.post(API.menus.submenus, { ...body, menu_id: menuId });
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
  async updateSubmenu(id: number, body: MenuPayload) {
    const res = await api.patch(API.menus.updateSubmenu(id), body);
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
  async deleteSubmenu(id: number) {
    const res = await api.delete(API.menus.deleteSubmenu(id));
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },

  async createSubsubmenu(submenuId: number, body: MenuPayload) {
    const res = await api.post(API.menus.subsubmenus, { ...body, submenu_id: submenuId });
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
  async updateSubsubmenu(id: number, body: MenuPayload) {
    const res = await api.patch(API.menus.updateSubsubmenu(id), body);
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
  async deleteSubsubmenu(id: number) {
    const res = await api.delete(API.menus.deleteSubsubmenu(id));
    clearEntityCache(ENTITY_CACHE_KEYS.menus);
    return res;
  },
};

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { response?: { data?: { detail?: string; message?: string } } };
  return e.response?.data?.detail || e.response?.data?.message || fallback;
}