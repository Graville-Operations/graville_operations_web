import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import type { MaterialItem, ToolItem } from '@/types/store';
import {
  normaliseMaterialItems,
  normaliseToolItems,
  type RawMaterialItem,
  type RawToolItem,
} from '@/lib/mappers/store-mappers';

export async function fetchMaterialsPage(
  siteId: number,
  skip: number,
  limit = 20,
): Promise<MaterialItem[]> {
  const res = await api.get(API.stores.materials(siteId), { params: { skip, limit } });
  return normaliseMaterialItems(unwrapArray<RawMaterialItem>(res.data));
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
  return normaliseToolItems(unwrapArray<RawToolItem>(res.data));
}