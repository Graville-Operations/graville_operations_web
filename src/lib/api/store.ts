import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import type { MaterialItem, ToolItem } from '@/types/store';

export function unwrapList<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) return d.items as T[];
    if (Array.isArray(d.data))  return d.data  as T[];
  }
  if (Array.isArray(r.data))  return r.data  as T[];
  if (Array.isArray(r.items)) return r.items as T[];
  return [];
}

export function unwrapRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    return r.data as Record<string, unknown>;
  }
  return r;
}

export async function fetchMaterialsPage(
  siteId: number,
  skip: number,
  limit = 20,
): Promise<MaterialItem[]> {
  const res = await api.get(API.stores.materials(siteId), { params: { skip, limit } });
  const raw = (res.data as { data?: unknown })?.data ?? res.data;
  return unwrapList<MaterialItem>(raw);
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
  const raw = (res.data as { data?: unknown })?.data ?? res.data;
  return unwrapList<ToolItem>(raw);
}