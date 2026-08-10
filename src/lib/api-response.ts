export interface ApiEnvelope<T = unknown> {
  code: number;
  data: T | null;
  message: string;
}

export function unwrapApiResponse<T>(res: { data: ApiEnvelope<T> }): T {
  const body = res.data;
  if (!body?.data) {
    throw new Error(body?.message || 'Something went wrong. Please try again.');
  }
  return body.data;
}

export function unwrapArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];
    }
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

export function unwrapObject<T>(response: unknown): T {
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return obj.data as T;
    }
  }
  return response as T;
}
export function extractPagedList<T>(data: T[] | { items?: T[] } | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}
export function extractNestedList(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.data)) return obj.data;
  const nested = obj.data as Record<string, unknown> | undefined;
  if (nested && Array.isArray(nested.items)) return nested.items;
  return [];
}