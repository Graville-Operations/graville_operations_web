import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import {
  normaliseSiteListItems,
  normaliseSiteDetail,
  normaliseSiteWorkers,
  normaliseAttendanceSummary,
  normaliseSiteTasks,
  normaliseOverviewKPIs,
  normaliseSiteAnalytics,
  normaliseDashboardMetrics,
  normaliseFieldOperatorList,
} from '@/lib/mappers/site-mappers';
import {
  Site, SiteListItemDTO, SiteDetail, SiteDetailDTO, SiteWorker, SiteWorkerDTO,
  AttendanceRecord, AttendanceSummaryDTO,
  SiteTask, SiteTaskDTO, CreateSitePayload, OverviewKPIs, OverviewKPIsDTO,
  SiteAnalytics, SiteAnalyticsDTO, FieldOperator, UpdateSitePayload,
} from '@/types/site';
import { DashboardMetrics, DashboardMetricsDTO } from '@/types/dashboard';

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get(API.sites.list);
  return normaliseSiteListItems(unwrapArray<SiteListItemDTO>(data));
}

export async function fetchSiteById(siteId: number): Promise<SiteDetail> {
  const { data } = await api.get(API.sites.detail(siteId));
  return normaliseSiteDetail(unwrapObject<SiteDetailDTO>(data));
}

export async function updateSite(siteId: number, payload: UpdateSitePayload): Promise<SiteDetail> {
  const { data } = await api.patch(API.sites.update(siteId), payload);
  return normaliseSiteDetail(unwrapObject<SiteDetailDTO>(data));
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const { data } = await api.post(API.sites.create, payload);
  return normaliseSiteListItems([unwrapObject<SiteListItemDTO>(data)])[0];
}

export async function fetchWorkersBySite(siteId: number): Promise<SiteWorker[]> {
  const { data } = await api.get(API.workers.listBySite(siteId));
  return normaliseSiteWorkers(unwrapArray<SiteWorkerDTO>(data));
}
export async function fetchAttendanceBySite(siteId: number): Promise<AttendanceRecord[]> {
  const { data } = await api.get(API.attendance.summary, {
    params: { site_id: siteId },
  });
  return normaliseAttendanceSummary(unwrapObject<AttendanceSummaryDTO>(data)).records;
}

export async function fetchTasksBySiteId(siteId: number): Promise<SiteTask[]> {
  const { data } = await api.get(API.tasks.listBySite(siteId));
  const arr = normaliseSiteTasks(unwrapArray<SiteTaskDTO>(data));
  if (arr.length > 0) return arr;

  const dto = unwrapObject<SiteTaskDTO | null>(data);
  return dto ? [normaliseSiteTasks([dto])[0]] : [];
}

export async function fetchOverviewKPIs(): Promise<OverviewKPIs> {
  const { data } = await api.get(API.analytics.overview);
  return normaliseOverviewKPIs(unwrapObject<OverviewKPIsDTO>(data));
}

export async function fetchSiteAnalytics(siteId: number | string): Promise<SiteAnalytics | null> {
  const { data } = await api.get(API.sites.analytics(siteId));
  if (!data) return null;
  return normaliseSiteAnalytics(unwrapObject<SiteAnalyticsDTO>(data));
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get(API.sites.dashboardMetrics);
  return normaliseDashboardMetrics(unwrapObject<DashboardMetricsDTO>(data));
}

export async function fetchUnassignedFieldOperators(): Promise<FieldOperator[]> {
  const { data } = await api.get(API.sites.unassignedOperators);
  return normaliseFieldOperatorList(unwrapArray<unknown>(data));
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