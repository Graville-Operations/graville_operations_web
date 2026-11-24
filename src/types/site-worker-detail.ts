export interface WorkerAttendanceEntry {
  id: number;
  date: string;
  checkInTime: string;
}

export interface WorkerAssignedTask {
  id: number;
  name: string;
  percentage: number;
  description: string | null;
  status: string;
}

export interface SiteWorkerDetail {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
  status: string;
  skillName: string | null;
  dailyRate: number | null;
  attendances: WorkerAttendanceEntry[];
  tasks: WorkerAssignedTask[];
}

/** One row of the All Workers table. Detail fields fill in once loaded. */
export interface SiteWorkerRow {
  id: number;
  fullName: string;
  status: string;
  skillName: string | null;
  detail: SiteWorkerDetail | null;
  detailFailed: boolean;
}
