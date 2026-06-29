'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

import { format, parseISO, subDays } from 'date-fns';
import api from '@/lib/api';
import { fetchSites, fetchOverviewKPIs } from '@/lib/api/sites';
import {
  Site, ProjectStatus, SiteStatus, OverviewKPIs,
  SiteDetail, AttendanceRecord,
} from '@/types/site';
import {
  MapPin, Search, Calendar, Building2, AlertCircle, Loader2,
  FileText, Briefcase, Users, ClipboardList, UserCheck,
  ChevronLeft, ChevronDown, ChevronUp, CheckCircle2,
  RefreshCw, DollarSign, TrendingUp,
  Download, PiggyBank, Receipt, CalendarRange, ArrowLeft,
} from 'lucide-react';

interface RawSite {
  id: number;
  name: string;
  location?: string;
  projectStatus?: string;
  siteStatus?: string;
  deadlineDate?: string;
  completion_date?: string;
  [key: string]: unknown;
}

interface AttendanceSummary {
  site_id: number;
  start_date: string;
  end_date: string;
  total: number;
  payouts: number;
  records: AttendanceRecord[];
}

interface SubtaskBreakdown {
  subtaskName: string;
  completionPercentage: number;
}

interface TaskBreakdownItem {
  taskName: string;
  subtaskBreakdown: SubtaskBreakdown[];
}

interface AttendanceBreakdownItem {
  day: string;
  date: string;
  attendanceCount: number;
}

interface SiteAnalytics {
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

interface SiteDetailExtended extends SiteDetail {
  estimatedValue?: number;
  tendererName?: string;
  inquiringEntity?: string;
  completionDate?: string;
  createdAt?: string;
}

function unwrapAttendanceSummary(raw: unknown): AttendanceSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    const d = obj.data as Record<string, unknown>;
    if (Array.isArray(d.records)) return d as unknown as AttendanceSummary;
  }
  return null;
}

function unwrapObject<T>(raw: unknown): T {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return obj.data as T;
    }
  }
  return raw as T;
}

function unwrapAnalytics(raw: unknown): SiteAnalytics | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') return obj.data as SiteAnalytics;
  return raw as SiteAnalytics;
}

// ── Subtask / task breakdown normalization ──
// The backend has, at various times, sent this nested block in snake_case
// (task_name / subtask_breakdown / subtask_name / completion_percentage)
// instead of the camelCase shape our types expect. When that happens the
// camelCase fields read as `undefined`, so the subtask rows render with a
// missing/0% completion value even though the percentage was actually
// returned by the API. Normalize defensively so either casing works.
function normalizeSubtaskBreakdown(raw: unknown): SubtaskBreakdown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    const obj = (s ?? {}) as Record<string, unknown>;
    // Accept whichever percentage field name the backend actually sent.
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

function normalizeTaskBreakdown(raw: unknown): TaskBreakdownItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => {
    const obj = (t ?? {}) as Record<string, unknown>;
    const nameRaw = obj.taskName ?? obj.task_name ?? obj.name ?? obj.title ?? '';
    // The nested subtask array has shown up under several different keys
    // depending on the endpoint/version, so check all the likely ones
    // rather than assuming a single shape.
    const subtasksRaw =
      obj.subtaskBreakdown ?? obj.subtask_breakdown ??
      obj.subtasks ?? obj.sub_tasks ?? obj.items ?? [];
    return {
      taskName: String(nameRaw),
      subtaskBreakdown: normalizeSubtaskBreakdown(subtasksRaw),
    };
  });
}

const SITE_STATUS_META: Record<SiteStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Active',   color: 'text-green-300', bg: 'bg-green-500/20 border border-green-500/40' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-300',  bg: 'bg-gray-500/20 border border-gray-500/40'  },
  CLOSED:   { label: 'Closed',   color: 'text-red-300',   bg: 'bg-red-500/20 border border-red-500/40'    },
};

// Accepts any casing: "Active", "ACTIVE", "active", "INACTIVE", "Closed", etc.
function normSiteStatus(s: unknown): SiteStatus {
  switch (String(s ?? '').toLowerCase()) {
    case 'active':   return 'ACTIVE';
    case 'inactive': return 'INACTIVE';
    case 'closed':   return 'CLOSED';
    default:         return 'INACTIVE';
  }
}

function normProjectStatus(s: string): ProjectStatus {
  switch ((s ?? '').toLowerCase().replace(/[\s-]+/g, '_')) {
    case 'planning':    return 'PLANNING';
    case 'in_progress': return 'IN_PROGRESS';
    case 'on_hold':     return 'ON_HOLD';
    case 'completed':   return 'COMPLETED';
    case 'cancelled':   return 'CANCELLED';
    default:            return 'PLANNING';
  }
}

function ProgressBar({ pct, color = 'var(--gv-brand)', height = 'h-2' }: {
  pct: number; color?: string; height?: string;
}) {
  return (
    <div className={`w-full ${height} rounded-full overflow-hidden`}
      style={{ background: 'var(--gv-glass-bg-strong)' }}>
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}

function QuickStatPill({ label, value, loading }: {
  label: string; value: number | string; loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-2 py-3"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <p className="text-sm mb-1 text-center font-medium" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
      {loading
        ? <div className="h-6 w-6 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-3xl font-bold text-white leading-none">{value}</p>}
    </div>
  );
}

function SiteCard({ site, onClick }: { site: RawSite; onClick: () => void }) {
  const ss       = normSiteStatus(site.siteStatus);
  const siteMeta = SITE_STATUS_META[ss];

  // Completion rate isn't available on the list payload (only on /sites/analytics/:id),
  // so the card shows 0 until the user opens the site detail view.
  const pct = 0;

  return (
    <div onClick={onClick}
      className="gv-card gv-card-hover flex flex-col gap-3 cursor-pointer group active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-xl text-white leading-tight">{site.name}</p>
        <span className={`text-base font-semibold px-3 py-1 rounded-full flex-shrink-0 ${siteMeta.bg} ${siteMeta.color}`}>
          {siteMeta.label}
        </span>
      </div>
      {site.deadlineDate && (
        <div className="flex items-center gap-2 text-lg" style={{ color: 'var(--gv-text-muted)' }}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Deadline: {site.deadlineDate}</span>
        </div>
      )}
      {!site.deadlineDate && site.completion_date && (
        <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Deadline: {format(new Date(site.completion_date), 'dd MMM yyyy')}</span>
        </div>
      )}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: 'var(--gv-text-subtle)' }}>Progress</p>
          <p className="text-sm font-bold" style={{ color: 'var(--gv-brand)' }}>{pct}%</p>
        </div>
        <ProgressBar pct={pct} height="h-2" />
      </div>
    </div>
  );
}

function ProjectCompletionGauge({ taskPct, timePct }: { taskPct: number; timePct: number }) {
  const CX = 110, CY = 110, R_outer = 88, R_inner = 64, SW = 13;
  const outerCirc = 2 * Math.PI * R_outer;
  const innerCirc = 2 * Math.PI * R_inner;
  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220, height: 'auto' }}>
        {/* outer track */}
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="#f97316" strokeWidth={SW}
          strokeDasharray={`${(timePct / 100) * outerCirc} ${outerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        {/* inner track */}
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        {/* inner = task completion (blue) */}
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${(taskPct / 100) * innerCirc} ${innerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="26" fontWeight="700" fill="white">{taskPct}%</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.4)">completion</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />Project completion ({taskPct}%)
        </span>
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-500" />% to deadline day ({timePct}%)
        </span>
      </div>
      <p className="text-base font-semibold text-white mt-3 text-center">Project Completion</p>
    </div>
  );
}

function ExpenditureGauge({
  totalExpenditure,
  estimatedValue,
  timePct,
}: {
  totalExpenditure: number;
  estimatedValue: number;
  timePct: number;
}) {
  const CX = 110, CY = 110, R_outer = 88, R_inner = 64, SW = 13;
  const outerCirc = 2 * Math.PI * R_outer;
  const innerCirc = 2 * Math.PI * R_inner;

  const expendPct = estimatedValue > 0
    ? Math.min(100, Math.round((totalExpenditure / estimatedValue) * 100))
    : 0;

  const fmtKes = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220, height: 'auto' }}>
        {/* Outer ring: time elapsed */}
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="#f97316" strokeWidth={SW}
          strokeDasharray={`${(timePct / 100) * outerCirc} ${outerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        {/* Inner ring: expenditure % */}
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${(expendPct / 100) * innerCirc} ${innerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="26" fontWeight="700" fill="white">{expendPct}%</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.4)">spent</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />Expenditure ({fmtKes(totalExpenditure)})
        </span>
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-500" />% to deadline day ({timePct}%)
        </span>
      </div>
      <p className="text-base font-semibold text-white mt-3 text-center">Expenditure</p>
    </div>
  );
}

function WeeklyAttendanceChart({ breakdown, totalWorkers }: { breakdown: AttendanceBreakdownItem[]; totalWorkers: number }) {
  const counts   = breakdown.map((d) => d.attendanceCount);
  const maxCount = Math.max(...counts, 1);

  // Absolute scale: bar height represents count / scaleMax, where scaleMax
  // is anchored to the site's total workforce — not to the other days in
  // the current week. This means a single day with 3 check-ins stays
  // small and proportional rather than filling the bar just because it's
  // the only non-zero day, and a jump from 3 to 8 always reads as the
  // same visual jump no matter what other days look like.
  // A floor of 10 keeps bars from looking exaggerated on very small sites,
  // and Math.max(..., maxCount) guarantees no bar ever overflows the track.
  const scaleMax = Math.max(totalWorkers > 0 ? totalWorkers : 0, maxCount, 10);

  const CHART_HEIGHT = 200;                        // total height available for the chart
  const LABEL_SPACE  = 26;                         // space reserved above each bar for its count label
  const BAR_TRACK    = CHART_HEIGHT - LABEL_SPACE; // height of the track behind each bar
  const BAR_MIN      = 6;                          // smallest filled height so a non-zero count is never invisible
  const BAR_ZERO     = 3;                          // sliver height for days with 0 attendance

  function barHeightPx(count: number) {
    if (count <= 0) return BAR_ZERO;
    const ratio = Math.min(count / scaleMax, 1);
    return Math.max(BAR_MIN, Math.round(ratio * BAR_TRACK));
  }

  const DAY_ABBR: Record<string, string> = {
    Sunday: 'S', Monday: 'M', Tuesday: 'T',
    Wednesday: 'W', Thursday: 'T', Friday: 'F', Saturday: 'S',
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-1" style={{ height: CHART_HEIGHT }}>
        {breakdown.map((item) => {
          const barPx   = barHeightPx(item.attendanceCount);
          const isToday = item.date === format(new Date(), 'yyyy-MM-dd');
          return (
            <div key={item.date} className="flex flex-col items-center justify-end gap-1 flex-1"
              style={{ height: CHART_HEIGHT }}>
              <span className="text-xs font-semibold"
                style={{
                  color: 'var(--gv-text-subtle)',
                  visibility: item.attendanceCount > 0 ? 'visible' : 'hidden',
                }}>
                {item.attendanceCount}
              </span>
              {/* Track: always visible so the chart reads as a bar graph even on quiet days */}
              <div className="relative w-full rounded-t-md overflow-hidden"
                style={{ maxWidth: 32, height: BAR_TRACK, background: 'rgba(255,255,255,0.06)' }}>
                <div className="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-500"
                  style={{ height: barPx, background: isToday ? '#3b82f6' : 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1">
        {breakdown.map((item) => (
          <div key={item.date} className="flex-1 flex justify-center">
            <span className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
              {DAY_ABBR[item.day] ?? item.day[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTaskRow({ task }: { task: TaskBreakdownItem }) {
  const [open, setOpen] = useState(false);
  const subtasks = task.subtaskBreakdown ?? [];
  const total    = subtasks.length;
  const totalPct = subtasks.reduce((a, s) => a + s.completionPercentage, 0);
  const taskPct  = total > 0 ? Math.min(100, Math.round(totalPct / total)) : 0;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)' }}>
          <CheckCircle2 className={`w-4 h-4 ${taskPct === 100 ? 'text-teal-300' : 'text-blue-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{task.taskName}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar pct={taskPct} color={taskPct === 100 ? '#14b8a6' : 'var(--gv-brand)'} height="h-1.5" />
            </div>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--gv-brand)' }}>
              {taskPct}%
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-subtle)' }}>
            {total > 0 ? `${total} subtask${total !== 1 ? 's' : ''}` : 'No subtasks'}
            {total > 0 ? ` · ${taskPct}% completion` : ''}
          </p>
        </div>
        {open
          ? <ChevronUp   className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />}
      </button>
      {open && subtasks.length > 0 && (
        <div className="px-4 pb-3 space-y-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          {subtasks.map((sub, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 py-2 px-3 rounded-xl"
              style={{ background: 'var(--gv-glass-bg-strong)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-white truncate">{sub.subtaskName}</span>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--gv-brand)' }}>
                  {sub.completionPercentage}%
                </span>
              </div>
              <ProgressBar
                pct={sub.completionPercentage}
                color={sub.completionPercentage === 100 ? '#14b8a6' : 'var(--gv-brand)'}
                height="h-1"
              />
            </div>
          ))}
        </div>
      )}
      {open && subtasks.length === 0 && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--gv-text-subtle)' }}>No subtasks recorded</p>
        </div>
      )}
    </div>
  );
}

function safeFormat(value: unknown, fmt: string): string | null {
  if (!value) return null;
  try {
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return null;
    return format(d, fmt);
  } catch {
    return null;
  }
}

function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const name     = record.workerName ?? '—';
  const initials = name !== '—'
    ? name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Use safeFormat (same helper as the CSV export) instead of calling
  // `new Date(...)` + `format(...)` directly here. checkInTime/date can be
  // null, empty, or an unparsable string depending on the source record,
  // and format() throws "Invalid time value" on an invalid Date rather
  // than returning a fallback string.
  const checkInDate =
    safeFormat(record.checkInTime, 'dd MMM yyyy, hh:mm aa') ??
    safeFormat(record.date, 'dd MMM yyyy') ??
    '—';

  return (
    <div className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
        style={{ background: 'rgba(51,144,124,0.2)', border: '1px solid rgba(51,144,124,0.4)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-white capitalize">{name}</p>
        <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{record.phone ?? '—'}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Check In: {checkInDate}</p>
        {record.nationalId && (
          <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>ID: {record.nationalId}</p>
        )}
      </div>
    </div>
  );
}

function AllWorkersScreen({
  records,
  dateLabel,
  onClose,
}: {
  records: AttendanceRecord[];
  dateLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'var(--gv-bg-gradient)' }}>
      <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{
          background: 'var(--gv-nav-bg)',
          borderBottom: '1px solid var(--gv-glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
        <button onClick={onClose} className="flex items-center gap-2 text-base font-semibold"
          style={{ color: 'var(--gv-brand)' }}>
          <ArrowLeft className="w-5 h-5" />Back
        </button>
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-white">Workers on Site</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{dateLabel}</p>
        </div>
        <span className="w-16" />
      </div>

      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-base font-semibold"
          style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907C' }}>
          <Users className="w-4 h-4" />
          {records.length} worker{records.length !== 1 ? 's' : ''} checked in
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
            <p className="text-base text-white">No check-ins for this period</p>
          </div>
        ) : (
          <div className="gv-card" style={{ padding: '0 1rem' }}>
            {records.map((r) => <AttendanceRow key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}

interface DateRangePickerProps {
  from: string;
  to: string;
  maxDate: string;
  onChange: (from: string, to: string) => void;
}

function DateRangePicker({ from, to, maxDate, onChange }: DateRangePickerProps) {
  const [open, setOpen]           = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo,   setDraftTo  ] = useState(to);
  const ref = useRef<HTMLDivElement>(null);

  function handleOpen() { setDraftFrom(from); setDraftTo(to); setOpen(true); }
  function handleApply() {
    const f = draftFrom <= draftTo ? draftFrom : draftTo;
    const t = draftFrom <= draftTo ? draftTo   : draftFrom;
    onChange(f, t);
    setOpen(false);
  }
  function handleCancel() { setOpen(false); }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const label = from === to
    ? format(parseISO(from), 'dd MMM yyyy')
    : `${format(parseISO(from), 'dd MMM yyyy')} → ${format(parseISO(to), 'dd MMM yyyy')}`;

  const today = new Date();
  const presets = [
    { label: 'Today',         f: format(today, 'yyyy-MM-dd'),              t: format(today, 'yyyy-MM-dd') },
    { label: 'Yesterday',     f: format(subDays(today, 1), 'yyyy-MM-dd'),  t: format(subDays(today, 1), 'yyyy-MM-dd') },
    { label: 'Last 7 days',   f: format(subDays(today, 6), 'yyyy-MM-dd'),  t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 30 days',  f: format(subDays(today, 29), 'yyyy-MM-dd'), t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 3 months', f: format(subDays(today, 89), 'yyyy-MM-dd'), t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 6 months', f: format(subDays(today, 179), 'yyyy-MM-dd'),t: format(today, 'yyyy-MM-dd') },
  ];

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <span>{label}</span>
        </div>
        <button onClick={handleOpen}
          className="flex items-center gap-1.5 text-base font-semibold px-3 py-1.5 rounded-xl"
          style={{ color: 'var(--gv-brand)', background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
          <CalendarRange className="w-4 h-4" />Pick Range
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
          style={{
            background: 'var(--gv-nav-bg)',
            border: '1px solid var(--gv-glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            minWidth: 300,
            top: '100%',
            marginTop: 8,
          }}>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => {
              const active = draftFrom === p.f && draftTo === p.t;
              return (
                <button key={p.label}
                  onClick={() => { setDraftFrom(p.f); setDraftTo(p.t); }}
                  className="text-sm px-2 py-1.5 rounded-xl text-left"
                  style={{
                    background: active ? 'var(--gv-brand)' : 'var(--gv-glass-bg-strong)',
                    border: `1px solid ${active ? 'var(--gv-brand)' : 'var(--gv-glass-border)'}`,
                    color: active ? 'white' : 'var(--gv-text-muted)',
                  }}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>From</label>
              <input type="date" value={draftFrom} max={maxDate}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="gv-input text-base py-2 w-full cursor-pointer" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>To</label>
              <input type="date" value={draftTo} min={draftFrom} max={maxDate}
                onChange={(e) => setDraftTo(e.target.value)}
                className="gv-input text-base py-2 w-full cursor-pointer" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleCancel} className="flex-1 text-base py-2 rounded-xl"
              style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}>
              Cancel
            </button>
            <button onClick={handleApply} className="flex-1 text-base py-2 rounded-xl font-semibold text-white"
              style={{ background: 'var(--gv-brand)' }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function downloadAttendanceCSV(records: AttendanceRecord[], dateLabel: string, siteName: string) {
  if (records.length === 0) return;

  const headers = ['Name', 'Phone', 'National ID', 'Check In'];
  const rows = records.map((r) => {
    const name      = r.workerName ?? '';
    const phone     = r.phone      ?? '';
    const nationalId= r.nationalId ?? '';
    const checkIn   =
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

function SiteDetailView({ site, onBack }: { site: RawSite; onBack: () => void }) {

  useEffect(() => {
    const sidebar = document.querySelector('aside') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    return () => { if (sidebar) sidebar.style.display = ''; };
  }, []);

  const ss       = normSiteStatus(site.siteStatus);
  const siteMeta = SITE_STATUS_META[ss];

  const [analytics,       setAnalytics      ] = useState<SiteAnalytics | null>(null);
  const [loadingAnalytics,setLoadingAnalytics] = useState(true);

  const [detail,       setDetail      ] = useState<SiteDetailExtended | null>(null);
  const [loadingDetail,setLoadingDetail] = useState(true);

  const [rangeRecords, setRangeRecords] = useState<AttendanceRecord[]>([]);
  const [rangePayouts, setRangePayouts] = useState<number>(0);
  const [loadingRange, setLoadingRange] = useState(true);

  const [showAllWorkers, setShowAllWorkers] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [rangeFrom, setRangeFrom] = useState(todayStr);
  const [rangeTo,   setRangeTo  ] = useState(todayStr);

  const loadAnalytics = useCallback(() => {
    setLoadingAnalytics(true);
    api.get(`/sites/analytics/${site.id}`)
      .then(({ data }) => {
        const a = unwrapAnalytics(data);
        if (!a) {
          setAnalytics(a);
          return;
        }
        // Normalize taskBreakdown/subtaskBreakdown so the subtasks always
        // arrive with their completion percentage attached, regardless of
        // whether the backend used camelCase, snake_case, or an entirely
        // different key (tasks / task_list) for the array itself.
        const rawTaskBreakdown =
          (a as unknown as Record<string, unknown>).taskBreakdown ??
          (a as unknown as Record<string, unknown>).task_breakdown ??
          (a as unknown as Record<string, unknown>).tasks ??
          (a as unknown as Record<string, unknown>).task_list;
        setAnalytics({
          ...a,
          taskBreakdown: normalizeTaskBreakdown(rawTaskBreakdown),
        });
      })
      .catch(() => {})
      .finally(() => setLoadingAnalytics(false));
  }, [site.id]);

  const loadDetail = useCallback(() => {
    setLoadingDetail(true);
    api.get(`/sites/${site.id}`)
      .then(({ data }) => setDetail(unwrapObject<SiteDetailExtended>(data)))
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [site.id]);

  const loadRange = useCallback((from: string, to: string) => {
    if (!from || !to) return;
    setLoadingRange(true);
    api.get('/attendance/summary', {
      params: { site_id: site.id, start_date: from, end_date: to },
    })
      .then(({ data }) => {
        const summary = unwrapAttendanceSummary(data);
        setRangeRecords(summary?.records ?? []);
        setRangePayouts(summary?.payouts ?? 0);
      })
      .catch(() => { setRangeRecords([]); setRangePayouts(0); })
      .finally(() => setLoadingRange(false));
  }, [site.id]);

  useEffect(() => {
    loadDetail();
    loadAnalytics();
  }, [loadDetail, loadAnalytics]);

  useEffect(() => {
    loadRange(rangeFrom, rangeTo);
  }, [rangeFrom, rangeTo, loadRange]);

  // ── Derived values ──

  const fmtKes = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const estimatedValue  = analytics?.estimatedProjectValue  ?? detail?.estimatedValue ?? 0;
  const totalExpenditure= analytics?.totalExpenditure       ?? 0;
  const expendRemaining = analytics?.expenditureRemaining   ?? 0;
  const availableBudget = expendRemaining >= 0 ? expendRemaining : 0;

  const projectCompletion = analytics?.projectCompletionPercentage ?? 0;
  const timePct           = analytics?.timeCompletionPercentage     ?? 0;

  const todayAttendance    = analytics?.todayAttendance    ?? 0;
  const previousAttendance = analytics?.previousAttendance ?? 0;
  const attendanceBreakdown= analytics?.attendanceBreakdown ?? [];
  const taskBreakdown      = analytics?.taskBreakdown        ?? [];
  const completedTasks     = analytics?.completedTasks       ?? 0;
  const totalWorkers       = analytics?.totalWorkers         ?? 0;

  const rangeLabel = rangeFrom === rangeTo
    ? format(parseISO(rangeFrom), 'dd MMM yyyy')
    : `${format(parseISO(rangeFrom), 'dd MMM')} – ${format(parseISO(rangeTo), 'dd MMM yyyy')}`;

  const PREVIEW_LIMIT  = 5;
  const previewRecords = rangeRecords.slice(0, PREVIEW_LIMIT);
  const hasMore        = rangeRecords.length > PREVIEW_LIMIT;

  return (
    <>
      {showAllWorkers && (
        <AllWorkersScreen
          records={rangeRecords}
          dateLabel={rangeLabel}
          onClose={() => setShowAllWorkers(false)}
        />
      )}

      <div className="w-full" style={{ background: 'var(--gv-bg-gradient)', minHeight: '100vh' }}>

        {/* ── Fixed nav bar ── */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4"
          style={{
            background: 'var(--gv-nav-bg)',
            borderBottom: '1px solid var(--gv-glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)',
          }}>
          <button onClick={onBack} className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--gv-brand)' }}>
            <ChevronLeft className="w-5 h-5" />Back to Sites
          </button>
          <span className="text-lg font-bold text-white flex-1 text-center">Site Details</span>
          <span className="w-28" />
        </div>

        <div className="mx-auto pt-20 pb-20" style={{ width: '80%' }}>
          <div className="flex flex-col gap-8">

            <div className="gv-card flex flex-col gap-5"
              style={{ background: 'linear-gradient(135deg,rgba(30,42,58,0.95) 0%,rgba(20,32,46,0.95) 100%)' }}>
              <div className="flex items-start justify-between gap-4">
                {loadingDetail
                  ? <div className="h-9 w-64 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <h1 className="text-4xl font-bold text-white leading-tight">{detail?.name ?? site.name}</h1>}
                <span className={`text-base font-semibold px-4 py-1.5 rounded-full flex-shrink-0 ${siteMeta.bg} ${siteMeta.color}`}>
                  {siteMeta.label}
                </span>
              </div>
              {loadingDetail ? (
                <div className="grid grid-cols-2 gap-3">
                  {[70, 55, 65, 50].map((w, i) => (
                    <div key={i} className="h-5 rounded animate-pulse"
                      style={{ background: 'var(--gv-glass-bg-strong)', width: `${w}%` }} />
                  ))}
                </div>
              ) : detail && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detail.location && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <MapPin className="w-4 h-4 flex-shrink-0" /><span>{detail.location}</span>
                    </div>
                  )}
                  {detail.description && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <FileText className="w-4 h-4 flex-shrink-0" /><span>{detail.description}</span>
                    </div>
                  )}
                  {(detail.createdAt || detail.completionDate) && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {detail.createdAt ? `Started ${detail.createdAt}` : ''}
                        {detail.completionDate ? ` · Deadline ${detail.completionDate}` : ''}
                      </span>
                    </div>
                  )}
                  {detail.tendererName && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <Briefcase className="w-4 h-4 flex-shrink-0" /><span>Tenderer: {detail.tendererName}</span>
                    </div>
                  )}
                  {detail.inquiringEntity && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <Building2 className="w-4 h-4 flex-shrink-0" /><span>Procuring entity: {detail.inquiringEntity}</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--gv-glass-border)', paddingTop: '1.25rem' }}>
                <p className="gv-label">Estimated Value</p>
                {loadingDetail && !analytics
                  ? <div className="h-8 w-40 rounded animate-pulse mt-1" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <p className="text-4xl font-bold text-white">{fmtKes(estimatedValue)}</p>}
              </div>
            </div>

            <section>
              <p className="text-2xl font-semibold text-white mb-4">Project Overview</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Total Workers</p>
                  {loadingAnalytics
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-5xl font-bold text-white">{totalWorkers}</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Overall headcount</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Completion Rate</p>
                  {loadingAnalytics
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-5xl font-bold text-white">{projectCompletion}%</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Based on subtasks from DB</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Tasks Completed</p>
                  {loadingAnalytics
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-5xl font-bold text-white">{completedTasks}</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{completedTasks} of {taskBreakdown.length} tasks</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Estimated Value</p>
                  {loadingAnalytics && !detail
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-2xl font-bold text-white leading-tight">{fmtKes(estimatedValue)}</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Total budget</p>
                </div>
              </div>
            </section>
            <section>
              <p className="text-2xl font-semibold text-white mb-4">Financials</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: DollarSign, label: 'Estimated Value',    value: fmtKes(estimatedValue),  sub: 'Total project budget',              loading: loadingAnalytics && !detail },
                  { icon: Receipt,    label: 'Project Expenditure', value: fmtKes(totalExpenditure),sub: 'Spent to date',                     loading: loadingAnalytics },
                  { icon: PiggyBank,  label: 'Available Budget',    value: fmtKes(availableBudget), sub: 'Estimated value minus expenditure', loading: loadingAnalytics },
                ].map((card) => (
                  <div key={card.label} className="gv-card flex items-center gap-4">
                    <div className="gv-icon-box flex-shrink-0">
                      <card.icon className="w-5 h-5" style={{ color: 'var(--gv-brand)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="gv-label">{card.label}</p>
                      {card.loading
                        ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                        : <p className="text-2xl font-bold text-white">{card.value}</p>}
                      <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="text-2xl font-semibold text-white mb-4">Visual Metrics</p>
              <div className="gv-card">
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    <span className="text-base" style={{ color: 'var(--gv-text-muted)' }}>Loading metrics…</span>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="flex-1 flex flex-col items-center px-6 py-2">
                      <ProjectCompletionGauge taskPct={projectCompletion} timePct={timePct} />
                    </div>
                    <div className="self-stretch w-px my-4" style={{ background: 'var(--gv-glass-border)' }} />
                    <div className="flex-1 flex flex-col items-center px-6 py-2">
                      <ExpenditureGauge
                        totalExpenditure={totalExpenditure}
                        estimatedValue={estimatedValue}
                        timePct={timePct}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
            <section>
              <p className="text-2xl font-semibold text-white mb-4">Attendance</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Today / Previous cards — left column */}
                <div className="flex flex-col gap-4">
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--gv-brand)' }}>
                      <Calendar className="w-3.5 h-3.5" />Today
                    </div>
                    {loadingAnalytics
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-5xl font-bold text-white">{todayAttendance}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Check-ins today</p>
                  </div>
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--gv-text-muted)' }}>
                      <RefreshCw className="w-3.5 h-3.5" />Previous
                    </div>
                    {loadingAnalytics
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-5xl font-bold text-white">{previousAttendance}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Yesterday's check-ins</p>
                  </div>
                </div>
                <div className="gv-card md:col-span-2 flex flex-col">
                  <p className="text-base font-semibold text-white mb-4">Daily Attendance</p>
                  {loadingAnalytics ? (
                    <div className="flex items-center justify-center py-10 flex-1">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    </div>
                  ) : attendanceBreakdown.length > 0 ? (
                    <div className="mt-auto">
                      <WeeklyAttendanceChart breakdown={attendanceBreakdown} totalWorkers={totalWorkers} />
                    </div>
                  ) : (
                    <p className="text-sm text-center py-6 flex-1 flex items-center justify-center" style={{ color: 'var(--gv-text-subtle)' }}>
                      No attendance data available
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-semibold text-white">Task Breakdown</p>
                </div>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                ) : taskBreakdown.length === 0 ? (
                  <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                    <ClipboardList className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                    <p className="text-base text-white">No tasks yet</p>
                    <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Tasks assigned to this site will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {taskBreakdown.map((task, idx) => (
                      <AnalyticsTaskRow key={idx} task={task} />
                    ))}
                  </div>
                )}
              </section>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-semibold text-white">Workers on Site</p>
                  <button
                    type="button"
                    onClick={() => downloadAttendanceCSV(rangeRecords, rangeLabel, site.name)}
                    disabled={rangeRecords.length === 0}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity"
                    style={{
                      background: 'var(--gv-glass-bg)',
                      border: '1px solid var(--gv-glass-border)',
                      opacity: rangeRecords.length === 0 ? 0.4 : 1,
                      cursor: rangeRecords.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                    title="Download attendance CSV"
                  >
                    <Download className="w-3.5 h-3.5" style={{ color: 'var(--gv-text-muted)' }} />
                  </button>
                </div>

                <DateRangePicker
                  from={rangeFrom}
                  to={rangeTo}
                  maxDate={todayStr}
                  onChange={(f, t) => { setRangeFrom(f); setRangeTo(t); }}
                />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--gv-brand)' }}>
                      <Users className="w-3.5 h-3.5" />Present
                    </div>
                    {loadingRange
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-5xl font-bold text-white">{rangeRecords.length}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{rangeLabel}</p>
                  </div>
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: '#f87171' }}>
                      <TrendingUp className="w-3.5 h-3.5" />Payouts
                    </div>
                    {loadingRange
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-3xl font-bold text-white">{fmtKes(rangePayouts)}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}></p>
                  </div>
                </div>

                {loadingRange ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                ) : rangeRecords.length === 0 ? (
                  <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                    <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                    <p className="text-base text-white">No check-ins for {rangeLabel}</p>
                    <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Try a different date range</p>
                  </div>
                ) : (
                  <>
                    <div className="gv-card" style={{ padding: '0 1rem' }}>
                      {previewRecords.map((r) => <AttendanceRow key={r.id} record={r} />)}
                    </div>
                    {hasMore && (
                      <button
                        onClick={() => setShowAllWorkers(true)}
                        className="mt-3 w-full py-3 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'var(--gv-glass-bg)',
                          border: '1px solid var(--gv-glass-border)',
                          color: 'var(--gv-brand)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(51,144,124,0.12)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(51,144,124,0.4)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gv-glass-bg)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gv-glass-border)';
                        }}
                      >
                        <Users className="w-4 h-4" />
                        View all {rangeRecords.length} workers
                      </button>
                    )}
                  </>
                )}
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const LS_KEY = 'gv_selected_site';

export default function ConstructionSitesPage() {
  const [sites,         setSites        ] = useState<Site[]>([]);
  const [kpis,          setKpis         ] = useState<OverviewKPIs | null>(null);
  const [loadingSites,  setLoadingSites ] = useState(true);
  const [loadingKpis,   setLoadingKpis  ] = useState(true);
  const [sitesError,    setSitesError   ] = useState<string | null>(null);
  const [search,        setSearch       ] = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const [selectedSite, setSelectedSite] = useState<RawSite | null>(null);

  // Read any previously-selected site from localStorage after mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSelectedSite(JSON.parse(raw) as RawSite);
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  const load = useCallback(() => {
    setLoadingSites(true); setSitesError(null);
    fetchSites()
      .then((data) => setSites(data))
      .catch((err: unknown) =>
        setSitesError(err instanceof Error ? err.message : 'Failed to load sites'))
      .finally(() => setLoadingSites(false));

    setLoadingKpis(true);
    fetchOverviewKPIs()
      .then((res) => { const d = (res as { data?: OverviewKPIs }).data ?? (res as OverviewKPIs); setKpis(d); })
      .catch(() => {})
      .finally(() => setLoadingKpis(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openSite(site: RawSite) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(site)); } catch {}
    setSelectedSite(site);
  }

  function closeSite() {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setSelectedSite(null);
  }

  if (selectedSite) {
    return <SiteDetailView site={selectedSite} onBack={closeSite} />;
  }

  const totalSites    = kpis?.totalSites    ?? 0;
  const planningSites = kpis?.planningSites ?? 0;
  const activeSites   = kpis?.activeSites   ?? 0;
  const pausedSites   = sites.filter((s) => normProjectStatus(s.project_status as unknown as string) === 'ON_HOLD').length;
  const doneSites     = sites.filter((s) => normProjectStatus(s.project_status as unknown as string) === 'COMPLETED').length;

  const filtered = sites.filter((s) => {
    const q           = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || (s.location ?? '').toLowerCase().includes(q);
    const matchProj   = projectFilter === 'ALL' || normProjectStatus(s.project_status as unknown as string) === projectFilter;
    return matchSearch && matchProj;
  });

  return (
    <div className="gv-page-dashboard flex flex-col gap-0 overflow-y-auto pb-10">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-white">Construction Sites</h1>
        <p className="text-base mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
          Overview of all active and completed projects
        </p>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-5 gap-2">
          <QuickStatPill label="Total"  value={totalSites}    loading={loadingKpis} />
          <QuickStatPill label="Plan"   value={planningSites} loading={loadingKpis} />
          <QuickStatPill label="Active" value={activeSites}   loading={loadingKpis} />
          <QuickStatPill label="Done"   value={doneSites}     loading={loadingKpis} />
          <QuickStatPill label="Paused" value={pausedSites}   loading={loadingKpis} />
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--gv-text-faint)' }} />
          <input type="text" placeholder="Search by name or location..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="gv-input pl-10 w-full" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {([
            { label: 'All',       value: 'ALL'         },
            { label: 'On-going',  value: 'IN_PROGRESS' },
            { label: 'Completed', value: 'COMPLETED'   },
            { label: 'Paused',    value: 'ON_HOLD'     },
          ] as const).map((f) => {
            const active = projectFilter === f.value;
            return (
              <button key={f.value}
                onClick={() => setProjectFilter(f.value as ProjectStatus | 'ALL')}
                className="text-base font-medium px-4 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all"
                style={active
                  ? { background: 'white', color: '#0b1120' }
                  : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      {sitesError && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl px-4 py-3 text-base"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{sitesError}
          <button onClick={load} className="ml-auto underline text-sm">Retry</button>
        </div>
      )}
      {loadingSites ? (
        <div className="px-4 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="gv-icon-box w-14 h-14 mb-4" style={{ opacity: 0.4 }}>
            <Building2 className="w-7 h-7" style={{ color: 'var(--gv-brand)' }} />
          </div>
          <p className="text-base font-medium text-white">
            {sites.length === 0 ? 'No sites yet' : 'No results found'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>
            {sites.length === 0 ? 'Create your first project to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {filtered.map((site) => (
            <SiteCard key={site.id} site={site as unknown as RawSite} onClick={() => openSite(site as unknown as RawSite)} />
          ))}
        </div>
      )}
    </div>
  );
}