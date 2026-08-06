import { ProjectStatus } from '@/types/enums/project-status';
import { SiteStatus } from '@/types/enums/site-status';
import type {
  Site,
  SiteDetail,
  FieldOperator,
  SiteWorker,
  AttendanceRecord,
  AttendanceSummary,
  SiteTask,
  SubTask,
  OverviewKPIs,
  SiteAnalytics,
} from '@/types/site';
import type { DashboardMetrics } from '@/types/dashboard';
export interface RawSiteListItem {
  id: number;
  name?: string;
  location?: string | null;
  projectStatus?: string;
  siteStatus?: string;
  deadlineDate?: string | null;
}

export function normaliseSiteListItem(raw: RawSiteListItem): Site {
  return {
    id: raw.id,
    name: raw.name ?? '',
    location: raw.location ?? null,
    project_status: (raw.projectStatus as ProjectStatus) ?? ProjectStatus.PLANNING,
    site_status: (raw.siteStatus as SiteStatus) ?? SiteStatus.ACTIVE,
    created_at: '',
    updated_at: null,
    completion_date: raw.deadlineDate ?? null,
    latitude: null,
    longitude: null,
    created_by: 0,
    updated_by: null,
    tags: [],
    description: null,
    tender_name: null,
    inquiring_entity: null,
    field_operator_id: null,
  };
}

export function normaliseSiteListItems(raw: RawSiteListItem[]): Site[] {
  return raw.map(normaliseSiteListItem);
}

export function normaliseFieldOperator(raw: unknown): FieldOperator | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const firstName = (o.firstName ?? o.first_name ?? '') as string;
  const middleName = (o.middleName ?? o.middle_name ?? '') as string;
  const lastName = (o.lastName ?? o.last_name ?? '') as string;

  const name =
    (o.name as string) ||
    [firstName, middleName, lastName].filter(Boolean).join(' ').trim() ||
    'Unnamed Operator';

  return {
    id: Number(o.id),
    name,
    email: (o.email as string) ?? '',
    phone: (o.phone ?? o.phone_number ?? o.phoneNumber ?? '') as string,
  };
}

export function normaliseFieldOperatorList(raw: unknown[]): FieldOperator[] {
  return raw
    .map(normaliseFieldOperator)
    .filter((op): op is FieldOperator => op !== null);
}

export interface RawSiteDetail {
  id: number;
  name?: string;
  location?: string | null;
  description?: string | null;
  projectStatus?: string;
  siteStatus?: string;
  latitude?: number | null;
  longitude?: number | null;
  completionDate?: string | null;
  tags?: string[];
  tendererName?: string | null;
  inquiringEntity?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  estimatedValue?: number;
  operator?: unknown;
}

export function normaliseSiteDetail(raw: RawSiteDetail): SiteDetail {
  return {
    id: raw.id,
    name: raw.name ?? '',
    location: raw.location ?? null,
    description: raw.description ?? null,
    projectStatus: raw.projectStatus ?? '',
    siteStatus: raw.siteStatus ?? '',
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    completionDate: raw.completionDate ?? null,
    tags: raw.tags ?? [],
    tendererName: raw.tendererName ?? null,
    inquiringEntity: raw.inquiringEntity ?? null,
    createdBy: raw.createdBy ?? null,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? null,
    estimatedValue: raw.estimatedValue,
    operator: normaliseFieldOperator(raw.operator),
  };
}
export interface RawSiteWorker {
  id: number;
  first_name?: string;
  last_name?: string;
  skill?: { id: number; name: string; amount: number } | null;
  status?: string;
}

export function normaliseSiteWorker(raw: RawSiteWorker): SiteWorker {
  return {
    id: raw.id,
    first_name: raw.first_name ?? '',
    last_name: raw.last_name ?? '',
    skill: raw.skill ?? null,
    status: raw.status ?? '',
  };
}

export function normaliseSiteWorkers(raw: RawSiteWorker[]): SiteWorker[] {
  return raw.map(normaliseSiteWorker);
}
export interface RawAttendanceRecord {
  id: number;
  site_id?: number;
  workerName?: string;
  date?: string;
  checkInTime?: string;
  phone?: string | null;
  nationalId?: string | null;
}

export function normaliseAttendanceRecord(raw: RawAttendanceRecord): AttendanceRecord {
  return {
    id: raw.id,
    site_id: raw.site_id ?? 0,
    workerName: raw.workerName ?? '',
    date: raw.date ?? '',
    checkInTime: raw.checkInTime ?? '',
    phone: raw.phone ?? null,
    nationalId: raw.nationalId ?? null,
  };
}

export interface RawAttendanceSummary {
  site_id?: number;
  start_date?: string;
  end_date?: string;
  total?: number;
  payouts?: number;
  records?: RawAttendanceRecord[];
}

export function normaliseAttendanceSummary(raw: RawAttendanceSummary): AttendanceSummary {
  return {
    site_id: raw.site_id ?? 0,
    start_date: raw.start_date ?? '',
    end_date: raw.end_date ?? '',
    total: raw.total ?? 0,
    payouts: raw.payouts ?? 0,
    records: (raw.records ?? []).map(normaliseAttendanceRecord),
  };
}
export interface RawSubTask {
  id: number;
  name?: string;
  description?: string | null;
  status?: string;
  completion_percentage?: number;
  task_id?: number;
  assigned_workers?: { id: number; first_name: string; last_name: string }[];
}

export function normaliseSubTask(raw: RawSubTask): SubTask {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? null,
    status: raw.status ?? '',
    start_date: null,
    end_date: null,
    task_id: raw.task_id ?? 0,
    completion_percentage: raw.completion_percentage ?? 0,
    assigned_workers: raw.assigned_workers ?? [],
  };
}

export interface RawSiteTask {
  id: number;
  name?: string;
  description?: string | null;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  site_id?: number;
  created_by?: number | null;
  subtasks?: RawSubTask[];
}

export function normaliseSiteTask(raw: RawSiteTask): SiteTask {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? null,
    status: raw.status ?? '',
    start_date: raw.start_date ?? null,
    end_date: raw.end_date ?? null,
    site_id: raw.site_id ?? 0,
    created_by: raw.created_by ?? null,
    subtasks: (raw.subtasks ?? []).map(normaliseSubTask),
  };
}

export function normaliseSiteTasks(raw: RawSiteTask[]): SiteTask[] {
  return raw.map(normaliseSiteTask);
}

export function normaliseOverviewKPIs(raw: Partial<OverviewKPIs>): OverviewKPIs {
  return {
    totalSites: raw.totalSites ?? 0,
    activeSites: raw.activeSites ?? 0,
    planningSites: raw.planningSites ?? 0,
    totalWorkers: raw.totalWorkers ?? 0,
    active_workers: raw.active_workers ?? 0,
    totalTasks: raw.totalTasks ?? 0,
    completedTasks: raw.completedTasks ?? 0,
    teasksCompletion: raw.teasksCompletion ?? 0,
    totalInvoiced: raw.totalInvoiced ?? 0,
    pendingInvoiceValue: raw.pendingInvoiceValue ?? 0,
    totalPermits: raw.totalPermits ?? 0,
    expiring_permits: raw.expiring_permits ?? 0,
    Rejecktedpermits: raw.Rejecktedpermits ?? 0,
    avgReviewRating: raw.avgReviewRating ?? 0,
    totalReviews: raw.totalReviews ?? 0,
    pendingTransactionsransfers: raw.pendingTransactionsransfers ?? 0,
    attendanceEateToday: raw.attendanceEateToday ?? 0,
    presentToday: raw.presentToday ?? 0,
  };
}

export function normaliseSiteAnalytics(raw: Partial<SiteAnalytics>): SiteAnalytics {
  return {
    siteName: raw.siteName ?? '',
    totalWorkers: raw.totalWorkers ?? 0,
    projectCompletionPercentage: raw.projectCompletionPercentage ?? 0,
    timeCompletionPercentage: raw.timeCompletionPercentage ?? 0,
    completedTasks: raw.completedTasks ?? 0,
    estimatedProjectValue: raw.estimatedProjectValue ?? 0,
    totalExpenditure: raw.totalExpenditure ?? 0,
    expenditureRemaining: raw.expenditureRemaining ?? 0,
    todayAttendance: raw.todayAttendance ?? 0,
    previousAttendance: raw.previousAttendance ?? 0,
    taskBreakdown: raw.taskBreakdown ?? [],
    attendanceBreakdown: raw.attendanceBreakdown ?? [],
  };
}

export function normaliseDashboardMetrics(raw: Partial<DashboardMetrics>): DashboardMetrics {
  return {
    sites: raw.sites ?? 0,
    workers: raw.workers ?? 0,
    tasks: raw.tasks ?? { totalTasks: 0, completedTasks: 0, taskCompletionPercentage: 0 },
    expenditure: raw.expenditure ?? { supplier: 0, subcontractor: 0, total: 0 },
    totalPermits: raw.totalPermits ?? 0,
    attendancePercentageToday: raw.attendancePercentageToday ?? 0,
    projectStatus:
      raw.projectStatus ?? { planning: 0, inProgress: 0, onHold: 0, completed: 0, cancelled: 0 },
    permits: raw.permits ?? { pending: 0, approved: 0, rejected: 0 },
    materials:
      raw.materials ?? {
        totalMaterials: 0,
        totalTools: 0,
        toolsOnHire: 0,
        toolsInRepair: 0,
        sitesWithLowStocks: 0,
      },
    orders: raw.orders ?? { totalOrders: 0, orderBreakdown: [] },
  };
}