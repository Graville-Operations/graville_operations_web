import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { withRetry } from '@/lib/retry';
import type { Site } from '@/lib/sites-cache';
import type { Task, SubTask, Worker } from '@/lib/types';

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

function parseList<T>(data: unknown): T[] {
  if (!data) return [];
  const d = data as Record<string, unknown>;
  const arr = d?.items ?? d?.data ?? d?.sites ?? d?.tasks ?? d?.subtasks ?? d?.workers ?? data;
  return Array.isArray(arr) ? arr : [];
}

export async function fetchQualitySites(
  onRetry?: (attempt: number, max: number) => void
): Promise<Site[]> {
  return withRetry(
    async () => {
      const res = await api.get(API.sites.list);
      return parseList<Site>(res.data?.data ?? res.data);
    },
    { retries: 3, delayMs: 5000, onRetry }
  );
}

export async function fetchSiteDetail(siteId: number): Promise<SiteDetail> {
  const res = await api.get(API.sites.detail(siteId));
  return (res.data?.data ?? res.data) as SiteDetail;
}

export async function fetchSiteTasks(
  siteId: number,
  onRetry?: (attempt: number, max: number) => void
): Promise<Task[]> {
  return withRetry(
    async () => {
      const res = await api.get(API.tasks.list(siteId));
      return parseList<Task>(res.data?.data ?? res.data);
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
      const res = await api.get(API.tasks.subtasks.list(taskId));
      return parseList<SubTask>(res.data?.data ?? res.data);
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
  await api.post(API.tasks.subtasks.create, payload);
}

export async function fetchWorkersForSite(siteId: number): Promise<Worker[]> {
  const res = await api.get(API.workers.listBySite(siteId));
  return parseList<Worker>(res.data?.data ?? res.data);
}