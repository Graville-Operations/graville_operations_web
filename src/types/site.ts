import { ProjectStatus } from '@/types/enums/project-status';
import { SiteStatus } from '@/types/enums/site-status';

export { ProjectStatus, SiteStatus };

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

export interface FieldOperator {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  estimatedValue?: number;
  operator?: FieldOperator | null;
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

// --- merged from site-detail.ts ---

export interface RawSite {
  id: number;
  name: string;
  location?: string;
  projectStatus?: string;
  siteStatus?: string;
  deadlineDate?: string;
  completion_date?: string;
  [key: string]: unknown;
}

export interface AttendanceSummary {
  site_id: number;
  start_date: string;
  end_date: string;
  total: number;
  payouts: number;
  records: AttendanceRecord[];
}

export interface SubtaskBreakdown {
  subtaskName: string;
  completionPercentage: number;
}

export interface TaskBreakdownItem {
  taskName: string;
  subtaskBreakdown: SubtaskBreakdown[];
}

export interface AttendanceBreakdownItem {
  day: string;
  date: string;
  attendanceCount: number;
}

export interface SiteAnalytics {
  siteName: string;
  totalWorkers: number;
  projectCompletionPercentage: number;
  timeCompletionPercentage: number;
  completedTasks: number;
  estimatedProjectValue: number;
  totalExpenditure: number;
  expenditureRemaining: number;
  todayAttendance: number;
  previousAttendance: number;
  taskBreakdown: TaskBreakdownItem[];
  attendanceBreakdown: AttendanceBreakdownItem[];
}