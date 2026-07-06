
import { SiteDetail, AttendanceRecord } from './site';

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

export interface SiteDetailExtended extends SiteDetail {
  estimatedValue?: number;
}