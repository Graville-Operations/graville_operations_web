import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import {
  Site, SiteDetail, SiteWorker, AttendanceRecord,
  SiteTask, CreateSitePayload, OverviewKPIs,
} from '@/types/site';
import { SiteAnalytics, FieldOperator } from '@/types/site-detail';
import { DashboardMetrics } from '@/types/dashboard';

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

function normalizeOperator(raw: unknown): FieldOperator | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const firstName = (o.firstName ?? o.first_name ?? '') as string;
  const middleName = (o.middleName ?? o.middle_name ?? '') as string;
  const lastName  = (o.lastName ?? o.last_name ?? '') as string;

  const name =
    (o.name as string) ||
    [firstName, middleName, lastName].filter(Boolean).join(' ').trim() ||
    'Unnamed Operator';

  return {
    id: Number(o.id),
    name,
    email: (o.email as string) ?? '',
    phone: (o.phone ?? o.phone_number ?? o.phoneNumber ?? '') as string,
  };
}

function normalizeOperatorList(raw: unknown[]): FieldOperator[] {
  return raw
    .map(normalizeOperator)
    .filter((op): op is FieldOperator => op !== null);
}

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get(API.sites.list);
  return unwrapArray<Site>(data);
}

export async function fetchSiteById(siteId: number): Promise<SiteDetail> {
  const { data } = await api.get(API.sites.detail(siteId));
  const raw = unwrapObject<Record<string, unknown>>(data);
  const operator = normalizeOperator(raw.operator);
  return { ...(raw as unknown as SiteDetail), operator };
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const { data } = await api.post(API.sites.create, payload);
  return unwrapObject<Site>(data);
}

export async function fetchWorkersBySite(siteId: number): Promise<SiteWorker[]> {
  const { data } = await api.get(API.workers.listBySite(siteId));
  return unwrapArray<SiteWorker>(data);
}

export async function fetchAttendanceBySite(siteId: number): Promise<AttendanceRecord[]> {
  const { data } = await api.get(API.attendance.summary, {
    params: { site_id: siteId },
  });
  return unwrapArray<AttendanceRecord>(data);
}

export async function fetchTasksBySiteId(siteId: number): Promise<SiteTask[]> {
  const { data } = await api.get(API.tasks.listBySite(siteId));
  if (Array.isArray(data))      return data as SiteTask[];
  if (data?.data && Array.isArray(data.data)) return data.data as SiteTask[];
  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return [data.data as SiteTask];
  }
  return [];
}

export async function fetchOverviewKPIs(): Promise<OverviewKPIs> {
  const { data } = await api.get(API.analytics.overview);
  return unwrapObject<OverviewKPIs>(data);
}

export async function fetchSiteAnalytics(siteId: number | string): Promise<SiteAnalytics | null> {
  const { data } = await api.get(API.sites.analytics(siteId));
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  return (obj.data && typeof obj.data === 'object' ? obj.data : data) as SiteAnalytics | null;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get(API.sites.dashboardMetrics);
  return unwrapObject<DashboardMetrics>(data);
}

export async function fetchUnassignedFieldOperators(): Promise<FieldOperator[]> {
  const { data } = await api.get(API.sites.unassignedOperators);
  return normalizeOperatorList(unwrapArray<unknown>(data));
}

export async function assignFieldOperator(siteId: number, userId: number): Promise<void> {
  await api.patch(API.sites.assignOperator(siteId, userId));
}

export async function replaceFieldOperator(siteId: number, userId: number): Promise<void> {
  await api.patch(API.sites.replaceOperator(siteId), null, {
    params: { new_user_id: userId },
  });
}

export async function unassignFieldOperator(siteId: number): Promise<void> {
  await api.delete(API.sites.operator(siteId));
}