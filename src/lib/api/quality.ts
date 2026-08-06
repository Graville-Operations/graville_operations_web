import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { withRetry } from '@/lib/retry';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import type { Site } from '@/lib/sites-cache';
import type { Task, SubTask } from '@/lib/types';
import { fetchWorkersBySite } from '@/lib/api/sites';
import type { SiteWorker } from '@/types/site';
import {
  normaliseQualitySites,
  normaliseQualitySiteDetail,
  normaliseTasks,
  normaliseSubTasks,
  type RawQualitySite,
  type RawQualitySiteDetail,
  type RawTask,
  type RawSubTask,
} from '@/lib/mappers/quality-mappers';

export interface SiteDetail {
  id: number;
  name: string;
  location?: string | null;
  description?: string | null;
  estimatedValue: number;
  projectStatus: string;
  siteStatus: string;
  completionDate?: string | null;
  tags?: string[] | null;
  tendererName?: string | null;
  inquiringEntity?: string | null;
}

export async function fetchQualitySites(
  onRetry?: (attempt: number, max: number) => void
): Promise<Site[]> {
  return withRetry(
    async () => {
      const res = await api.get(API.sites.list);
      return normaliseQualitySites(unwrapArray<RawQualitySite>(res.data));
    },
    { retries: 3, delayMs: 5000, onRetry }
  );
}

export async function fetchSiteDetail(siteId: number): Promise<SiteDetail> {
  const res = await api.get(API.sites.detail(siteId));
  return normaliseQualitySiteDetail(unwrapObject<RawQualitySiteDetail>(res.data));
}

export async function updateSiteEstimatedValue(
  siteId: number,
  estimatedValue: number
): Promise<SiteDetail> {
  const res = await api.patch(API.sites.updateEstimatedValue(siteId), {
    estimated_value: estimatedValue,
  });
  return normaliseQualitySiteDetail(unwrapObject<RawQualitySiteDetail>(res.data));
}

export async function fetchSiteTasks(
  siteId: number,
  onRetry?: (attempt: number, max: number) => void
): Promise<Task[]> {
  return withRetry(
    async () => {
      const res = await api.get(API.tasks.listBySite(siteId));
      return normaliseTasks(unwrapArray<RawTask>(res.data));
    },
    { retries: 3, delayMs: 5000, onRetry }
  );
}

export interface CreateTaskPayload {
  name: string;
  description?: string;
  site_id: number;
  start_date: string;
  end_date: string;
}

export async function createTask(payload: CreateTaskPayload): Promise<void> {
  await api.post(API.tasks.create, payload);
}

export async function fetchSubtasks(
  taskId: number,
  onRetry?: (attempt: number, max: number) => void
): Promise<SubTask[]> {
  return withRetry(
    async () => {
      const res = await api.get(API.tasks.listSubtasksByTask(taskId));
      return normaliseSubTasks(unwrapArray<RawSubTask>(res.data));
    },
    { retries: 3, delayMs: 5000, onRetry }
  );
}

export interface CreateSubtaskPayload {
  name: string;
  description?: string;
  task_id: number;
  worker_ids: number[];
}

export async function createSubtask(payload: CreateSubtaskPayload): Promise<void> {
  await api.post(API.tasks.createSubtask, payload);
}
export async function fetchWorkersForSite(siteId: number): Promise<SiteWorker[]> {
  return fetchWorkersBySite(siteId);
}