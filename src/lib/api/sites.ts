import api from '@/lib/api';
import {
  Site, SiteDetail, SiteWorker, AttendanceRecord,
  SiteTask, CreateSitePayload, OverviewKPIs,
} from '@/types/site';

function unwrapArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.items))   return inner.items   as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];
    }
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

function unwrapObject<T>(response: unknown): T {
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return obj.data as T;
    }
  }
  return response as T;
}

// ── Sites ─────────────────────────────────────────────────────────────────────

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get('/sites/list');
  return unwrapArray<Site>(data);
}

export async function fetchSiteById(siteId: number): Promise<SiteDetail> {
  const { data } = await api.get(`/sites/${siteId}`);
  return unwrapObject<SiteDetail>(data);
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const { data } = await api.post('/sites/create', payload);
  return unwrapObject<Site>(data);
}

// ── Workers ───────────────────────────────────────────────────────────────────

export async function fetchWorkersBySite(siteId: number): Promise<SiteWorker[]> {
  const { data } = await api.get(`/workers/list-by-id/${siteId}`);
  return unwrapArray<SiteWorker>(data);
}

// ── Attendance ────────────────────────────────────────────────────────────────

export async function fetchAttendanceBySite(siteId: number): Promise<AttendanceRecord[]> {
  const { data } = await api.get(`/attendance/summary/${siteId}`);
  return unwrapArray<AttendanceRecord>(data);
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function fetchTasksBySiteId(siteId: number): Promise<SiteTask[]> {
  const { data } = await api.get(`/tasks/list/${siteId}`);
  // tasks may come as a single object or array
  if (Array.isArray(data))      return data as SiteTask[];
  if (data?.data && Array.isArray(data.data)) return data.data as SiteTask[];
  // single task wrapped in data
  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return [data.data as SiteTask];
  }
  return [];
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function fetchOverviewKPIs(): Promise<OverviewKPIs> {
  const { data } = await api.get('/analytics/overview');
  return unwrapObject<OverviewKPIs>(data);
}