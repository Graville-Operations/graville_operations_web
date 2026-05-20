import api from '@/lib/api';
import { Site, CreateSitePayload, OverviewKPIs } from '@/types/site';

function unwrapArray<T>(response: unknown): T[] {
  // handles { code, data: [...], message } envelope
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (Array.isArray(obj.data))    return obj.data    as T[];
    if (Array.isArray(obj.items))   return obj.items   as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  if (Array.isArray(response)) return response as T[];
  return [];
}

function unwrapObject<T>(response: unknown): T {
  // handles { code, data: {...}, message } envelope
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return obj.data as T;
    }
  }
  return response as T;
}

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get('/sites/list');
  return unwrapArray<Site>(data);
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const { data } = await api.post('/sites/create', payload);
  return unwrapObject<Site>(data);
}

export async function fetchOverviewKPIs(): Promise<OverviewKPIs> {
  const { data } = await api.get('/analytics/overview');
  return unwrapObject<OverviewKPIs>(data);
}