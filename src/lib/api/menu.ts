import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import { MenuItem, MenuDTO } from '@/types/menu';
import { normaliseMenus } from '@/lib/mappers/menu-mappers';

function dedupeByName(menus: MenuItem[]): MenuItem[] {
  const seen = new Set<string>();
  return menus.filter((m) => {
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
}

export async function fetchSidebarMenus(): Promise<MenuItem[]> {
  const { data } = await api.get(API.auth.meMenus);
  const menus = normaliseMenus(unwrapArray<MenuDTO>(data));
  return dedupeByName(menus);
}