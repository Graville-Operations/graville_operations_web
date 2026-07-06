import api from "@/lib/api";
import { cacheGet, cacheSet, cacheBust } from "@/lib/persistent-cache";
import { withRetry } from "@/lib/retry";
import type { Task, SubTask, Worker } from "@/lib/types";
import type { Site } from "@/lib/sites-cache";

export function parseList<T>(data: unknown): T[] {
  if (!data) return [];
  const d = data as Record<string, unknown>;
  const arr = d?.items ?? d?.data ?? d?.tasks ?? d?.subtasks ?? d?.sites ?? data;
  return Array.isArray(arr) ? arr : [];
}

export interface FetchTasksOptions {
  onRetry?: (attempt: number, max: number) => void;
}

// ── Cache helpers (tasks are cached per-site) ─────────────────────────

function tasksCacheKey(siteId: string | number): string {
  return `tasks:${siteId}`;
}

export function getCachedTasks(siteId: string | number): Task[] | null {
  return cacheGet<Task[]>(tasksCacheKey(siteId));
}

export function setCachedTasks(siteId: string | number, tasks: Task[]): void {
  cacheSet(tasksCacheKey(siteId), tasks);
}

export function bustTaskCache(siteId?: string | number): void {
  if (siteId !== undefined) cacheBust(tasksCacheKey(siteId));
  else cacheBust("tasks:");
}

//API calls
export async function fetchTasksForSite(
  siteId: string | number,
  options?: FetchTasksOptions
): Promise<Task[]> {
  return withRetry(
    async () => {
      const res = await api.get(`/tasks/list/${siteId}`);
      return parseList<Task>(res.data?.data ?? res.data);
    },
    {
      retries: 3,
      delayMs: 5000,
      onRetry: options?.onRetry,
    }
  );
}

export async function fetchSites(): Promise<Site[]> {
  const res = await api.get("/sites/list");
  return parseList<Site>(res.data?.data ?? res.data);
}

export interface CreateTaskPayload {
  name: string;
  description?: string;
  site_id: number;
  start_date: string;
  end_date: string;
}

export async function createTask(payload: CreateTaskPayload): Promise<void> {
  await api.post("/tasks/task/create", {
    name: payload.name,
    description: payload.description || undefined,
    site_id: payload.site_id,
    start_date: payload.start_date,
    end_date: payload.end_date,
  });
  bustTaskCache(payload.site_id);
}

export function extractErrorMessage(e: unknown, fallback: string): string {
  const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return detail ?? (e as Error)?.message ?? fallback;
}

//Subtasks

function subtasksCacheKey(taskId: number): string {
  return `subtasks:${taskId}`;
}

export function getCachedSubtasks(taskId: number): SubTask[] | null {
  return cacheGet<SubTask[]>(subtasksCacheKey(taskId));
}

export function setCachedSubtasks(taskId: number, subtasks: SubTask[]): void {
  cacheSet(subtasksCacheKey(taskId), subtasks);
}

export function bustSubtaskCache(taskId: number): void {
  cacheBust(subtasksCacheKey(taskId));
}

export async function fetchSubtasksForTask(
  taskId: number,
  options?: FetchTasksOptions
): Promise<SubTask[]> {
  return withRetry(
    async () => {
      const res = await api.get(`/tasks/sub-task/list/${taskId}`);
      return parseList<SubTask>(res.data?.data ?? res.data);
    },
    {
      retries: 3,
      delayMs: 5000,
      onRetry: options?.onRetry,
    }
  );
}

export async function fetchWorkersBySite(siteId: number): Promise<Worker[]> {
  const res = await api.get(`/workers/list-by-id/${siteId}`);
  return parseList<Worker>(res.data?.data ?? res.data);
}

export interface CreateSubtaskPayload {
  name: string;
  description?: string;
  task_id: number;
  worker_ids: number[];
}

export async function createSubtask(payload: CreateSubtaskPayload): Promise<void> {
  await api.post("/tasks/sub-task/create", {
    name: payload.name,
    description: payload.description || undefined,
    task_id: payload.task_id,
    worker_ids: payload.worker_ids,
  });
  bustSubtaskCache(payload.task_id);
}