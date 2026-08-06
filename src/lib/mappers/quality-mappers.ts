import type { Site } from '@/lib/sites-cache';
import type { Task, SubTask, Worker, TaskStatus, SubTaskStatus } from '@/lib/types';
import type { SiteDetail } from '@/lib/api/quality';

export interface RawQualitySite {
  id: number;
  name?: string;
}

export function normaliseQualitySite(raw: RawQualitySite): Site {
  return {
    id: raw.id,
    name: raw.name ?? '',
  };
}

export function normaliseQualitySites(raw: RawQualitySite[]): Site[] {
  return raw.map(normaliseQualitySite);
}

export interface RawQualitySiteDetail {
  id: number;
  name?: string;
  location?: string | null;
  description?: string | null;
  estimatedValue?: number;
  projectStatus?: string;
  siteStatus?: string;
  completionDate?: string | null;
  tags?: string[] | null;
  tendererName?: string | null;
  inquiringEntity?: string | null;
}

export function normaliseQualitySiteDetail(raw: RawQualitySiteDetail): SiteDetail {
  return {
    id: raw.id,
    name: raw.name ?? '',
    location: raw.location ?? null,
    description: raw.description ?? null,
    estimatedValue: raw.estimatedValue ?? 0,
    projectStatus: raw.projectStatus ?? '',
    siteStatus: raw.siteStatus ?? '',
    completionDate: raw.completionDate ?? null,
    tags: raw.tags ?? [],
    tendererName: raw.tendererName ?? null,
    inquiringEntity: raw.inquiringEntity ?? null,
  };
}

export interface RawWorkerBrief {
  id: number;
  first_name?: string;
  last_name?: string;
  skill?: { id: number; name: string; amount: number } | null;
}

export function normaliseWorkerBrief(raw: RawWorkerBrief): Worker {
  return {
    id: raw.id,
    first_name: raw.first_name ?? '',
    last_name: raw.last_name ?? '',
    skill: raw.skill ?? null,
  };
}

function normaliseTaskStatus(status: string | undefined): TaskStatus {
  const upper = (status ?? '').toUpperCase();
  const valid: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'];
  return (valid as string[]).includes(upper) ? (upper as TaskStatus) : 'PENDING';
}

function normaliseSubTaskStatus(status: string | undefined): SubTaskStatus {
  const upper = (status ?? '').toUpperCase();
  const valid: SubTaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  return (valid as string[]).includes(upper) ? (upper as SubTaskStatus) : 'PENDING';
}

export interface RawSubTask {
  id: number;
  name?: string;
  description?: string | null;
  status?: string;
  completion_percentage?: number;
  task_id?: number;
  assigned_workers?: RawWorkerBrief[];
}

export function normaliseSubTask(raw: RawSubTask): SubTask {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? undefined,
    status: normaliseSubTaskStatus(raw.status),
    completion_percentage: raw.completion_percentage ?? 0,
    task_id: raw.task_id ?? 0,
    assigned_workers: (raw.assigned_workers ?? []).map(normaliseWorkerBrief),
  };
}

export function normaliseSubTasks(raw: RawSubTask[]): SubTask[] {
  return raw.map(normaliseSubTask);
}

export interface RawTask {
  id: number;
  name?: string;
  description?: string | null;
  status?: string;
  start_date?: string;
  end_date?: string;
  site_id?: number;
  subtasks?: RawSubTask[];
}

export function normaliseTask(raw: RawTask): Task {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? undefined,
    status: normaliseTaskStatus(raw.status),
    start_date: raw.start_date ?? '',
    end_date: raw.end_date ?? '',
    site_id: raw.site_id ?? 0,
    subtasks: raw.subtasks ? normaliseSubTasks(raw.subtasks) : undefined,
  };
}

export function normaliseTasks(raw: RawTask[]): Task[] {
  return raw.map(normaliseTask);
}