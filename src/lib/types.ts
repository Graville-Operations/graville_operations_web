import type { SiteBrief } from '@/types/site';

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD";
export type SubTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Site = SiteBrief;
export interface QualitySiteDTO {
  id: number;
  name?: string;
}

export interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  skill: { id: number; name: string; amount: number } | null;
}

export interface WorkerBriefDTO {
  id: number;
  first_name?: string;
  last_name?: string;
  skill?: { id: number; name: string; amount: number } | null;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  status: TaskStatus;
  start_date: string;
  end_date: string;
  site_id: number;
  created_by?: number | null;
  subtasks?: SubTask[];
}

export interface TaskDTO {
  id: number;
  name?: string;
  description?: string | null;
  status?: string;
  start_date?: string;
  end_date?: string;
  site_id?: number;
  created_by?: number | null;
  subtasks?: SubTaskDTO[];
}

export interface SubTask {
  id: number;
  name: string;
  description?: string;
  status: SubTaskStatus;
  completion_percentage: number;
  task_id: number;
  assigned_workers?: Worker[];
}

export interface SubTaskDTO {
  id: number;
  name?: string;
  description?: string | null;
  status?: string;
  completion_percentage?: number;
  task_id?: number;
  assigned_workers?: WorkerBriefDTO[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}