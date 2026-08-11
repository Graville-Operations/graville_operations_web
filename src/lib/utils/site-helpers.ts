import { format } from 'date-fns';
import { AttendanceRecord } from '@/types/site';
import { SiteStatus } from '@/types/enums/site-status';
import { ProjectStatus } from '@/types/enums/project-status';

export const SITE_STATUS_META: Record<SiteStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Active',   color: 'text-green-300', bg: 'bg-green-500/20 border border-green-500/40' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-300',  bg: 'bg-gray-500/20 border border-gray-500/40'  },
  CLOSED:   { label: 'Closed',   color: 'text-red-300',   bg: 'bg-red-500/20 border border-red-500/40'    },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  [ProjectStatus.PLANNING]:    { label: 'Planning',    color: 'text-blue-300',   bg: 'bg-blue-500/20 border border-blue-500/40' },
  [ProjectStatus.IN_PROGRESS]: { label: 'In Progress', color: 'text-green-300',  bg: 'bg-green-500/20 border border-green-500/40' },
  [ProjectStatus.ON_HOLD]:     { label: 'On Hold',     color: 'text-yellow-300', bg: 'bg-yellow-500/20 border border-yellow-500/40' },
  [ProjectStatus.COMPLETED]:   { label: 'Completed',   color: 'text-purple-300', bg: 'bg-purple-500/20 border border-purple-500/40' },
  [ProjectStatus.CANCELLED]:   { label: 'Cancelled',   color: 'text-red-300',    bg: 'bg-red-500/20 border border-red-500/40' },
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

export function getAllowedNextProjectStatuses(current: ProjectStatus): ProjectStatus[] {
  switch (current) {
    case ProjectStatus.PLANNING:
      return [ProjectStatus.IN_PROGRESS, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED];
    case ProjectStatus.IN_PROGRESS:
      return [ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED];
    case ProjectStatus.ON_HOLD:
      return [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED];
    case ProjectStatus.COMPLETED:
    case ProjectStatus.CANCELLED:
    default:
      return [];
  }
}

export function isProjectStatusLocked(status: ProjectStatus): boolean {
  return status === ProjectStatus.COMPLETED || status === ProjectStatus.CANCELLED;
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