import { ProjectStatus } from '@/types/enums/project-status';
import { SiteStatus } from '@/types/enums/site-status';
import type {
  Site,
  SiteListItemDTO,
  SiteDetail,
  SiteDetailDTO,
  FieldOperator,
  SiteWorker,
  SiteWorkerDTO,
  AttendanceRecord,
  AttendanceRecordDTO,
  AttendanceSummary,
  AttendanceSummaryDTO,
  SiteTask,
  SiteTaskDTO,
  OverviewKPIs,
  OverviewKPIsDTO,
  SiteAnalytics,
  SiteAnalyticsDTO,
} from '@/types/site';
import type { DashboardMetrics, DashboardMetricsDTO } from '@/types/dashboard';
import { normaliseTask, normaliseSubTask } from '@/lib/mappers/quality-mappers';

export { normaliseSubTask };

export function normaliseSiteListItem(dto: SiteListItemDTO): Site {
  return {
    id: dto.id,
    name: dto.name ?? '',
    location: dto.location ?? null,
    project_status: (dto.projectStatus as ProjectStatus) ?? ProjectStatus.PLANNING,
    site_status: (dto.siteStatus as SiteStatus) ?? SiteStatus.ACTIVE,
    created_at: '',
    updated_at: null,
    completion_date: dto.deadlineDate ?? null,
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

export function normaliseSiteListItems(dtos: SiteListItemDTO[]): Site[] {
  return dtos.map(normaliseSiteListItem);
}

export function normaliseFieldOperator(dto: unknown): FieldOperator | null {
  if (!dto || typeof dto !== 'object') return null;
  const o = dto as Record<string, unknown>;

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

export function normaliseFieldOperatorList(dtos: unknown[]): FieldOperator[] {
  return dtos
    .map(normaliseFieldOperator)
    .filter((op): op is FieldOperator => op !== null);
}

export function normaliseSiteDetail(dto: SiteDetailDTO): SiteDetail {
  return {
    id: dto.id,
    name: dto.name ?? '',
    location: dto.location ?? null,
    description: dto.description ?? null,
    projectStatus: dto.projectStatus ?? '',
    siteStatus: dto.siteStatus ?? '',
    latitude: dto.latitude ?? null,
    longitude: dto.longitude ?? null,
    completionDate: dto.completionDate ?? null,
    tags: dto.tags ?? [],
    tendererName: dto.tendererName ?? null,
    inquiringEntity: dto.inquiringEntity ?? null,
    createdBy: dto.createdBy ?? null,
    createdAt: dto.createdAt ?? '',
    updatedAt: dto.updatedAt ?? null,
    estimatedValue: dto.estimatedValue,
    operator: normaliseFieldOperator(dto.operator),
  };
}

export function normaliseSiteWorker(dto: SiteWorkerDTO): SiteWorker {
  return {
    id: dto.id,
    first_name: dto.first_name ?? '',
    last_name: dto.last_name ?? '',
    skill: dto.skill ?? null,
    status: dto.status ?? '',
  };
}

export function normaliseSiteWorkers(dtos: SiteWorkerDTO[]): SiteWorker[] {
  return dtos.map(normaliseSiteWorker);
}

export function normaliseAttendanceRecord(dto: AttendanceRecordDTO): AttendanceRecord {
  return {
    id: dto.id,
    site_id: dto.site_id ?? 0,
    workerName: dto.workerName ?? '',
    date: dto.date ?? '',
    checkInTime: dto.checkInTime ?? '',
    phone: dto.phone ?? null,
    nationalId: dto.nationalId ?? null,
  };
}

export function normaliseAttendanceSummary(dto: AttendanceSummaryDTO): AttendanceSummary {
  return {
    site_id: dto.site_id ?? 0,
    start_date: dto.start_date ?? '',
    end_date: dto.end_date ?? '',
    total: dto.total ?? 0,
    payouts: dto.payouts ?? 0,
    records: (dto.records ?? []).map(normaliseAttendanceRecord),
  };
}

export function normaliseSiteTask(dto: SiteTaskDTO): SiteTask {
  return normaliseTask(dto);
}

export function normaliseSiteTasks(dtos: SiteTaskDTO[]): SiteTask[] {
  return dtos.map(normaliseSiteTask);
}

export function normaliseOverviewKPIs(dto: OverviewKPIsDTO): OverviewKPIs {
  return {
    totalSites: dto.totalSites ?? 0,
    activeSites: dto.activeSites ?? 0,
    planningSites: dto.planningSites ?? 0,
    totalWorkers: dto.totalWorkers ?? 0,
    active_workers: dto.active_workers ?? 0,
    totalTasks: dto.totalTasks ?? 0,
    completedTasks: dto.completedTasks ?? 0,
    teasksCompletion: dto.teasksCompletion ?? 0,
    totalInvoiced: dto.totalInvoiced ?? 0,
    pendingInvoiceValue: dto.pendingInvoiceValue ?? 0,
    totalPermits: dto.totalPermits ?? 0,
    expiring_permits: dto.expiring_permits ?? 0,
    Rejecktedpermits: dto.Rejecktedpermits ?? 0,
    avgReviewRating: dto.avgReviewRating ?? 0,
    totalReviews: dto.totalReviews ?? 0,
    pendingTransactionsransfers: dto.pendingTransactionsransfers ?? 0,
    attendanceEateToday: dto.attendanceEateToday ?? 0,
    presentToday: dto.presentToday ?? 0,
  };
}

function normaliseSubtaskBreakdownItem(dto: unknown): { subtaskName: string; completionPercentage: number } {
  const obj = (dto ?? {}) as Record<string, unknown>;
  const pctRaw =
    obj.completionPercentage ?? obj.completion_percentage ??
    obj.percentage ?? obj.percent ?? obj.progress ?? 0;
  const pct = typeof pctRaw === 'number' ? pctRaw : Number(pctRaw) || 0;
  const nameRaw = obj.subtaskName ?? obj.subtask_name ?? obj.name ?? obj.title ?? '';
  return { subtaskName: String(nameRaw), completionPercentage: pct };
}

function normaliseTaskBreakdownItem(dto: unknown): { taskName: string; subtaskBreakdown: { subtaskName: string; completionPercentage: number }[] } {
  const obj = (dto ?? {}) as Record<string, unknown>;
  const nameRaw = obj.taskName ?? obj.task_name ?? obj.name ?? obj.title ?? '';
  const subtasksRaw =
    obj.subtaskBreakdown ?? obj.subtask_breakdown ??
    obj.subtasks ?? obj.sub_tasks ?? obj.items ?? [];
  return {
    taskName: String(nameRaw),
    subtaskBreakdown: Array.isArray(subtasksRaw) ? subtasksRaw.map(normaliseSubtaskBreakdownItem) : [],
  };
}

export function normaliseSiteAnalytics(dto: SiteAnalyticsDTO): SiteAnalytics {
  return {
    siteName: dto.siteName ?? '',
    totalWorkers: dto.totalWorkers ?? 0,
    projectCompletionPercentage: dto.projectCompletionPercentage ?? 0,
    timeCompletionPercentage: dto.timeCompletionPercentage ?? 0,
    completedTasks: dto.completedTasks ?? 0,
    estimatedProjectValue: dto.estimatedProjectValue ?? 0,
    totalExpenditure: dto.totalExpenditure ?? 0,
    expenditureRemaining: dto.expenditureRemaining ?? 0,
    todayAttendance: dto.todayAttendance ?? 0,
    previousAttendance: dto.previousAttendance ?? 0,
    taskBreakdown: Array.isArray(dto.taskBreakdown) ? dto.taskBreakdown.map(normaliseTaskBreakdownItem) : [],
    attendanceBreakdown: dto.attendanceBreakdown ?? [],
  };
}

export function normaliseDashboardMetrics(dto: DashboardMetricsDTO): DashboardMetrics {
  return {
    sites: dto.sites ?? 0,
    workers: dto.workers ?? 0,
    tasks: dto.tasks ?? { totalTasks: 0, completedTasks: 0, taskCompletionPercentage: 0 },
    expenditure: dto.expenditure ?? { supplier: 0, subcontractor: 0, total: 0 },
    totalPermits: dto.totalPermits ?? 0,
    attendancePercentageToday: dto.attendancePercentageToday ?? 0,
    projectStatus:
      dto.projectStatus ?? { planning: 0, inProgress: 0, onHold: 0, completed: 0, cancelled: 0 },
    permits: dto.permits ?? { pending: 0, approved: 0, rejected: 0 },
    materials:
      dto.materials ?? {
        totalMaterials: 0,
        totalTools: 0,
        toolsOnHire: 0,
        toolsInRepair: 0,
        sitesWithLowStocks: 0,
      },
    orders: dto.orders ?? { totalOrders: 0, orderBreakdown: [] },
  };
}