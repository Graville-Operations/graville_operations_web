export type TaskStatus = "pending" | "in_progress" | "completed";
export type SubTaskStatus = "pending" | "in_progress" | "completed";

export interface Site {
  id: number;
  name: string;
}

export interface Worker {
  id: number;
  name: string;
  role?: string;
  department?: string;
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