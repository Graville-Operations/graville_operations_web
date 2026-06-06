export type ProjectStatus =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type SiteStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface Site {
  id: number;
  name: string;
  location: string | null;
  project_status: ProjectStatus;
  site_status: SiteStatus;
  created_at: string;
  updated_at: string | null;
  completion_date: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: number;
  updated_by: number | null;
  tags: string[];
  description: string | null;
  tender_name: string | null;
  inquiring_entity: string | null;
  field_operator_id: number | null;
}

export interface SiteDetail {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  projectStatus: string;
  siteStatus: string;
  latitude: number | null;
  longitude: number | null;
  completionDate: string | null;
  tags: string[];
  tendererName: string | null;
  inquiringEntity: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface SiteWorker {
  id: number;
  first_name: string;
  last_name: string;
  skill: {
    id: number;
    name: string;
    amount: number;
  } | null;
  status: string;
}

export interface AttendanceRecord {
  id: number;
  site_id: number;
  workerName: string;
  date: string;
  checkInTime: string;
  phone: string | null;
  nationalId: string | null;
}
export interface SubTask {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  task_id: number;
  [key: string]: unknown;
}

export interface SiteTask {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  site_id: number;
  created_by: number | null;
  subtasks: SubTask[];
}

export interface CreateSitePayload {
  name: string;
  location?: string;
  project_status: ProjectStatus;
  site_status?: SiteStatus;
  completion_date?: string | null;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  description?: string;
  tender_name?: string;
  inquiring_entity?: string;
  field_operator_id?: number;
}

export interface OverviewKPIs {
  totalSites: number;
  activeSites: number;
  planningSites: number;
  totalWorkers: number;
  active_workers: number;
  totalTasks: number;
  completedTasks: number;
  teasksCompletion: number;
  totalInvoiced: number;
  pendingInvoiceValue: number;
  totalPermits: number;
  expiring_permits: number;
  Rejecktedpermits: number;
  avgReviewRating: number;
  totalReviews: number;
  pendingTransactionsransfers: number;
  attendanceEateToday: number;
  presentToday: number;
}