import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { MenuItem } from '@/types';

function unwrap<T>(data: unknown): T {
  return ((data as { data?: unknown })?.data ?? data) as T;
}

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
  const menuData = unwrap<MenuItem[]>(data);
  if (!Array.isArray(menuData)) return [];
  return dedupeByName(menuData);
}