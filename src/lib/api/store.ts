import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import type { MaterialItem, ToolItem } from '@/types/store';

export async function fetchMaterialsPage(
  siteId: number,
  skip: number,
  limit = 20,
): Promise<MaterialItem[]> {
  const res = await api.get(API.stores.materials(siteId), { params: { skip, limit } });
  return unwrapArray<MaterialItem>(res.data);
}

export async function fetchToolsPage(
  siteId: number,
  skip: number,
  limit = 20,
  status?: string,
): Promise<ToolItem[]> {
  const res = await api.get(API.stores.tools(siteId), {
    params: { skip, limit, ...(status ? { status } : {}) },
  });
  return unwrapArray<ToolItem>(res.data);
}