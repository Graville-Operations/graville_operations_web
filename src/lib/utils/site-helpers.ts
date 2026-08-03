import { format } from 'date-fns';
import { AttendanceRecord, SiteAnalytics, AttendanceSummary } from '@/types/site';
import { SiteStatus } from '@/types/enums/site-status';
import { ProjectStatus } from '@/types/enums/project-status';

export const SITE_STATUS_META: Record<SiteStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Active',   color: 'text-green-300', bg: 'bg-green-500/20 border border-green-500/40' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-300',  bg: 'bg-gray-500/20 border border-gray-500/40'  },
  CLOSED:   { label: 'Closed',   color: 'text-red-300',   bg: 'bg-red-500/20 border border-red-500/40'    },
};

export function normSiteStatus(s: unknown): SiteStatus {
  switch (String(s ?? '').toLowerCase()) {
    case 'active':   return SiteStatus.ACTIVE;
    case 'inactive': return SiteStatus.INACTIVE;
    case 'closed':   return SiteStatus.CLOSED;
    default:         return SiteStatus.INACTIVE;  }
}

export function normProjectStatus(s: string): ProjectStatus {
  switch ((s ?? '').toLowerCase().replace(/[\s-]+/g, '_')) {
    case 'planning':    return ProjectStatus.PLANNING;
    case 'in_progress': return ProjectStatus.IN_PROGRESS;
    case 'on_hold':     return ProjectStatus.ON_HOLD;
    case 'completed':   return ProjectStatus.COMPLETED;
    case 'cancelled':   return ProjectStatus.CANCELLED;
    default:            return ProjectStatus.PLANNING;
  }
}

export function unwrapAttendanceSummary(raw: unknown): AttendanceSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    const d = obj.data as Record<string, unknown>;
    if (Array.isArray(d.records)) return d as unknown as AttendanceSummary;
  }
  return null;
}

export function unwrapObject<T>(raw: unknown): T {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return obj.data as T;
    }
  }
  return raw as T;
}

export function unwrapAnalytics(raw: unknown): SiteAnalytics | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') return obj.data as SiteAnalytics;
  return raw as SiteAnalytics;
}

export function normalizeSubtaskBreakdown(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    const obj = (s ?? {}) as Record<string, unknown>;
    const pctRaw =
      obj.completionPercentage ?? obj.completion_percentage ??
      obj.percentage ?? obj.percent ?? obj.progress ?? 0;
    const pct = typeof pctRaw === 'number' ? pctRaw : Number(pctRaw) || 0;
    const nameRaw = obj.subtaskName ?? obj.subtask_name ?? obj.name ?? obj.title ?? '';
    return {
      subtaskName: String(nameRaw),
      completionPercentage: pct,
    };
  });
}

export function normalizeTaskBreakdown(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => {
    const obj = (t ?? {}) as Record<string, unknown>;
    const nameRaw = obj.taskName ?? obj.task_name ?? obj.name ?? obj.title ?? '';
    const subtasksRaw =
      obj.subtaskBreakdown ?? obj.subtask_breakdown ??
      obj.subtasks ?? obj.sub_tasks ?? obj.items ?? [];
    return {
      taskName: String(nameRaw),
      subtaskBreakdown: normalizeSubtaskBreakdown(subtasksRaw),
    };
  });
}

export function safeFormat(value: unknown, fmt: string): string | null {
  if (!value) return null;
  try {
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return null;
    return format(d, fmt);
  } catch {
    return null;
  }
}

export function downloadAttendanceCSV(records: AttendanceRecord[], dateLabel: string, siteName: string) {
  if (records.length === 0) return;

  const headers = ['Name', 'Phone', 'National ID', 'Check In'];
  const rows = records.map((r) => {
    const name       = r.workerName ?? '';
    const phone      = r.phone      ?? '';
    const nationalId = r.nationalId ?? '';
    const checkIn    =
      safeFormat(r.checkInTime, 'dd MMM yyyy HH:mm') ??
      safeFormat(r.date,        'dd MMM yyyy') ??
      '';
    return [name, phone, nationalId, checkIn].map((v) => `"${v}"`).join(',');
  });

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `attendance_${siteName.replace(/\s+/g, '_')}_${dateLabel}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function fmtKes(n: number): string {
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}