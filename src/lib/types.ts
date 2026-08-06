export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD";
export type SubTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Site {
  id: number;
  name: string;
}

export interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  skill: { id: number; name: string; amount: number } | null;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  status: TaskStatus;
  start_date: string;
  end_date: string;
  site_id: number;
  subtasks?: SubTask[];
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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}