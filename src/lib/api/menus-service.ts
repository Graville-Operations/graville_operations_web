import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import { Menu, MenuDTO, MenuPayload } from '@/types/menu';
import { normaliseMenus } from '@/lib/mappers/menu-mappers';

export const menusService = {
  async list(): Promise<Menu[]> {
    const { data } = await api.get(API.menus.list);
    return normaliseMenus(unwrapArray<MenuDTO>(data));
  },
  async createMenu(body: MenuPayload) {
    return api.post(API.menus.create, body);
  },
  async updateMenu(id: number, body: MenuPayload) {
    return api.patch(API.menus.update(id), body);
  },
  async deleteMenu(id: number) {
    return api.delete(API.menus.delete(id));
  },

  async createSubmenu(menuId: number, body: MenuPayload) {
    return api.post(API.menus.submenus, { ...body, menu_id: menuId });
  },
  async updateSubmenu(id: number, body: MenuPayload) {
    return api.patch(API.menus.updateSubmenu(id), body);
  },
  async deleteSubmenu(id: number) {
    return api.delete(API.menus.deleteSubmenu(id));
  },

  async createSubsubmenu(submenuId: number, body: MenuPayload) {
    return api.post(API.menus.subsubmenus, { ...body, submenu_id: submenuId });
  },
  async updateSubsubmenu(id: number, body: MenuPayload) {
    return api.patch(API.menus.updateSubsubmenu(id), body);
  },
  async deleteSubsubmenu(id: number) {
    return api.delete(API.menus.deleteSubsubmenu(id));
  },
};

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { response?: { data?: { detail?: string; message?: string } } };
  return e.response?.data?.detail || e.response?.data?.message || fallback;
}