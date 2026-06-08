'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import api from '@/lib/api';
import { fetchSites, fetchOverviewKPIs } from '@/lib/api/sites';
import {
  Site, ProjectStatus, SiteStatus, OverviewKPIs,
  SiteDetail, SiteWorker, AttendanceRecord, SiteTask,
} from '@/types/site';
import {
  MapPin, Search, Calendar, Building2, AlertCircle, Loader2,
  FileText, Briefcase, Users, ClipboardList, UserCheck,
  ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Circle,
  AlertTriangle, RefreshCw, DollarSign, TrendingUp,
  Download, PiggyBank, Receipt,
} from 'lucide-react';

interface AttendanceSummary {
  site_id: number;
  start_date: string;
  end_date: string;
  total: number;
  payouts: number;
  records: AttendanceRecord[];
}

interface Invoice {
  id: number;
  amount?: number;
  total_amount?: number;
  [key: string]: unknown;
}

interface StoreTool {
  id: number;
  hire_cost?: number;
  cost?: number;
  amount?: number;
  [key: string]: unknown;
}


function unwrapItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.items))   return inner.items   as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];
    }
    if (Array.isArray(obj.data))    return obj.data    as T[];
    if (Array.isArray(obj.items))   return obj.items   as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
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

function taskStatusMeta(status: string) {
  switch ((status ?? '').toLowerCase()) {
    case 'completed':
    case 'done':
      return { icon: CheckCircle2,  color: 'text-teal-300',   bg: 'bg-teal-500/15 border border-teal-500/30',     label: 'Completed'   };
    case 'in_progress':
    case 'in progress':
      return { icon: RefreshCw,     color: 'text-blue-300',   bg: 'bg-blue-500/15 border border-blue-500/30',     label: 'In Progress' };
    case 'cancelled':
      return { icon: X,             color: 'text-red-300',    bg: 'bg-red-500/15 border border-red-500/30',       label: 'Cancelled'   };
    case 'on_hold':
    case 'on hold':
      return { icon: AlertTriangle, color: 'text-yellow-300', bg: 'bg-yellow-500/15 border border-yellow-500/30', label: 'On Hold'     };
    default:
      return { icon: Circle,        color: 'text-gray-300',   bg: 'bg-gray-500/15 border border-gray-500/30',     label: status || 'Pending' };
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
      <p className="text-xs mb-1 text-center font-medium" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
      {loading
        ? <div className="h-6 w-6 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-2xl font-bold text-white leading-none">{value}</p>}
    </div>
  );
}

function SiteCard({ site, onClick }: { site: Site; onClick: () => void }) {
  // Cast through unknown so mixed-case values from the API ("Active") are handled
  const ss       = normSiteStatus(site.site_status as unknown);
  const siteMeta = SITE_STATUS_META[ss];
  const ps       = normProjectStatus(site.project_status as unknown as string);
  const pctMap: Record<string, number> = {
    PLANNING: 0, IN_PROGRESS: 50, ON_HOLD: 25, COMPLETED: 100, CANCELLED: 0,
  };
  const pct = pctMap[ps] ?? 0;

  return (
    <div onClick={onClick}
      className="gv-card gv-card-hover flex flex-col gap-3 cursor-pointer group active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-lg text-white leading-tight group-hover:text-[var(--gv-brand)] transition-colors">
          {site.name}
        </p>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0 ${siteMeta.bg} ${siteMeta.color}`}>
          {siteMeta.label}
        </span>
      </div>
      {site.location && (
        <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{site.location}</span>
        </div>
      )}
      {site.completion_date && (
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
        {/* outer = time elapsed (red) */}
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="#ef4444" strokeWidth={SW}
          strokeDasharray={`${(timePct / 100) * outerCirc} ${outerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        {/* inner track */}
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        {/* inner = task completion (blue) */}
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${(taskPct / 100) * innerCirc} ${innerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="white">{taskPct}%</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)">tasks done</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />Task completion
        </span>
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-red-500" />Time elapsed ({timePct}%)
        </span>
      </div>
      <p className="text-sm font-semibold text-white mt-3 text-center">Project Completion</p>
    </div>
  );
}

function WeeklyAttendanceGauge({ avgPresent, target }: { avgPresent: number; target: number }) {
  const CX = 110, CY = 110, R = 88, SW = 18;
  const circ        = 2 * Math.PI * R;
  const maxVal      = Math.max(target, avgPresent, 1);
  const presentDash = (avgPresent / maxVal) * circ;
  const targetDash  = (target / maxVal) * circ;
  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220, height: 'auto' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ef4444" strokeWidth={SW}
          strokeDasharray={`${targetDash} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${presentDash} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="26" fontWeight="700" fill="white">
          {avgPresent.toFixed(1)}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)">avg/day</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />Avg present
        </span>
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-red-500" />Target ({target})
        </span>
      </div>
      <p className="text-sm font-semibold text-white mt-3 text-center">Weekly Attendance</p>
      <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Avg per day</p>
    </div>
  );
}

function TaskAccordionRow({ task }: { task: SiteTask }) {
  const [open, setOpen] = useState(false);
  const subtasks = task.subtasks ?? [];
  const total    = subtasks.length;
  const done     = subtasks.filter(
    (s) => ['completed', 'done'].includes((s.status ?? '').toLowerCase())
  ).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const sm  = taskStatusMeta(task.status ?? '');
  const SI  = sm.icon;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)' }}>
          <SI className={`w-4 h-4 ${sm.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{task.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar pct={pct} color={pct === 100 ? '#14b8a6' : 'var(--gv-brand)'} height="h-1.5" />
            </div>
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--gv-brand)' }}>
              {pct}%
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-subtle)' }}>
            {done}/{total} subtask{total !== 1 ? 's' : ''} complete
          </p>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${sm.bg} ${sm.color}`}>
          {sm.label}
        </span>
        {open
          ? <ChevronUp   className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />}
      </button>
      {open && subtasks.length > 0 && (
        <div className="px-4 pb-3 space-y-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          {subtasks.map((sub) => {
            const ssm = taskStatusMeta(sub.status ?? '');
            const SSI = ssm.icon;
            return (
              <div key={sub.id} className="flex items-center gap-2 py-2 px-3 rounded-xl"
                style={{ background: 'var(--gv-glass-bg-strong)' }}>
                <SSI className={`w-3.5 h-3.5 flex-shrink-0 ${ssm.color}`} />
                <span className="text-xs text-white flex-1 truncate">{sub.name}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${ssm.bg} ${ssm.color}`}>
                  {ssm.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const name     = record.workerName ?? '—';
  const initials = name !== '—'
    ? name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const checkInDate = record.checkInTime
    ? format(new Date(record.checkInTime), 'dd MMM yyyy, hh:mm aa')
    : record.date ? format(new Date(record.date), 'dd MMM yyyy') : '—';

  return (
    <div className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
        style={{ background: 'rgba(51,144,124,0.2)', border: '1px solid rgba(51,144,124,0.4)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white capitalize">{name}</p>
        <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{record.phone ?? '—'}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Check In: {checkInDate}</p>
        {record.nationalId && (
          <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>ID: {record.nationalId}</p>
        )}
      </div>
    </div>
  );
}

function SiteDetailView({ site, onBack }: { site: Site; onBack: () => void }) {

  // Hide the sidebar while detail is open via direct DOM toggle — no layout changes needed
  useEffect(() => {
    const sidebar = document.querySelector('aside') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    return () => { if (sidebar) sidebar.style.display = ''; };
  }, []);

  const [detail,            setDetail           ] = useState<SiteDetail | null>(null);
  const [workers,           setWorkers          ] = useState<SiteWorker[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [tasks,             setTasks            ] = useState<SiteTask[]>([]);
  const [invoices,          setInvoices         ] = useState<Invoice[]>([]);
  const [tools,             setTools            ] = useState<StoreTool[]>([]);

  const [loadingDetail,     setLoadingDetail    ] = useState(true);
  const [loadingWorkers,    setLoadingWorkers   ] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingTasks,      setLoadingTasks     ] = useState(true);
  const [loadingFinancials, setLoadingFinancials] = useState(true);

  const [detailError,     setDetailError    ] = useState<string | null>(null);
  const [workersError,    setWorkersError   ] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [tasksError,      setTasksError     ] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [rangeFrom, setRangeFrom] = useState(todayStr);
  const [rangeTo,   setRangeTo  ] = useState(todayStr);

  const load = useCallback(() => {
    setLoadingDetail(true); setDetailError(null);
    api.get(`/sites/${site.id}`)
      .then(({ data }) => setDetail(unwrapObject<SiteDetail>(data)))
      .catch(() => setDetailError('Failed to load site details.'))
      .finally(() => setLoadingDetail(false));

    setLoadingWorkers(true); setWorkersError(null);
    api.get(`/workers/list-by-id/${site.id}`)
      .then(({ data }) => setWorkers(unwrapItems<SiteWorker>(data)))
      .catch(() => { setWorkersError('Failed to load workers.'); setWorkers([]); })
      .finally(() => setLoadingWorkers(false));

    setLoadingAttendance(true); setAttendanceError(null);
    api.get(`/attendance/summary/${site.id}`)
      .then(({ data }) => setAttendanceSummary(unwrapAttendanceSummary(data)))
      .catch(() => { setAttendanceError('Failed to load attendance.'); setAttendanceSummary(null); })
      .finally(() => setLoadingAttendance(false));

    setLoadingTasks(true); setTasksError(null);
    api.get(`/tasks/list/${site.id}`)
      .then(({ data }) => setTasks(unwrapItems<SiteTask>(data)))
      .catch(() => { setTasksError('Failed to load tasks.'); setTasks([]); })
      .finally(() => setLoadingTasks(false));

    setLoadingFinancials(true);
    Promise.allSettled([
      api.get('/invoices/all'),
      api.get(`/store/tools/${site.id}/all`),
    ]).then(([invRes, toolRes]) => {
      if (invRes.status  === 'fulfilled') setInvoices(unwrapItems<Invoice>(invRes.value.data));
      if (toolRes.status === 'fulfilled') setTools(unwrapItems<StoreTool>(toolRes.value.data));
    }).finally(() => setLoadingFinancials(false));
  }, [site.id]);

  useEffect(() => { load(); }, [load]);

  // Derived
  const allRecords = attendanceSummary?.records ?? [];
  const filteredRecords = allRecords.filter((r) => {
    const raw = r.checkInTime ?? r.date;
    if (!raw) return false;
    try {
      return isWithinInterval(new Date(raw), {
        start: startOfDay(parseISO(rangeFrom)),
        end:   endOfDay(parseISO(rangeTo)),
      });
    } catch { return false; }
  });
  const presentCount   = filteredRecords.length;
  const isDefaultRange = rangeFrom === todayStr && rangeTo === todayStr;
  const totalPayouts   = isDefaultRange && attendanceSummary?.payouts != null
    ? attendanceSummary.payouts
    : filteredRecords.reduce((acc, rec) => {
        const w = workers.find((w) => w.id === (rec as any).workerId);
        return acc + (w?.skill?.amount ?? 0);
      }, 0);

  const totalSubtasks  = tasks.reduce((a, t) => a + (t.subtasks?.length ?? 0), 0);
  const doneSubtasks   = tasks.reduce((a, t) =>
    a + (t.subtasks?.filter((s) => ['completed','done'].includes((s.status ?? '').toLowerCase())).length ?? 0), 0);
  const completionRate = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;
  const tasksCompleted = tasks.filter((t) => ['completed','done'].includes((t.status ?? '').toLowerCase())).length;

  const startDate      = detail?.createdAt ? new Date(detail.createdAt) : null;
  const endDate        = detail?.completionDate ? new Date(detail.completionDate) : null;
  const timePct        = startDate && endDate
    ? Math.min(100, Math.round(((Date.now() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100))
    : 0;
  const daysSinceStart = startDate ? Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / 86_400_000)) : 1;
  const avgPresent     = +(allRecords.length / daysSinceStart).toFixed(1);
  const TARGET_PER_DAY = workers.length > 0 ? workers.length : 8;

  const ESTIMATED_VALUE = 5_000_000;
  const invoiceTotal    = invoices.reduce((acc, inv) => acc + (inv.total_amount ?? inv.amount ?? 0), 0);
  const toolTotal       = tools.reduce((acc, t) => acc + (t.hire_cost ?? t.cost ?? t.amount ?? 0), 0);
  const expenditure     = invoiceTotal + toolTotal;
  const availableBudget = Math.max(0, ESTIMATED_VALUE - expenditure);

  // Status: from detail API ("Active") normalised to ACTIVE — not hardcoded
  const rawStatus = detail?.siteStatus ?? site.site_status;
  const ss        = normSiteStatus(rawStatus);
  const siteMeta  = SITE_STATUS_META[ss];

  const rangeLabel = rangeFrom === rangeTo
    ? format(parseISO(rangeFrom), 'dd MMM yyyy')
    : `${format(parseISO(rangeFrom), 'dd MMM')} – ${format(parseISO(rangeTo), 'dd MMM yyyy')}`;

  return (
    /*
     * The detail view renders inside layout's <main overflow-y-auto>.
     * We use position:fixed for the nav so it truly pins to the viewport
     * regardless of the scroll container, then pad the content below it.
     */
    <div className="w-full" style={{ background: 'var(--gv-bg-gradient)', minHeight: '100vh' }}>

      {/* FIXED nav — always visible, never scrolls away or overlaps */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4"
        style={{
          background: 'var(--gv-nav-bg)',
          borderBottom: '1px solid var(--gv-glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)',
        }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--gv-brand)' }}>
          <ChevronLeft className="w-5 h-5" />Back to Sites
        </button>
        <span className="text-base font-bold text-white flex-1 text-center">Site Details</span>
        <span className="w-28" />
      </div>

      {/* Content — pt-20 clears the fixed nav (nav height ≈ 64px + buffer) */}
      <div className="mx-auto pt-20 pb-20" style={{ width: '80%' }}>
        <div className="flex flex-col gap-8">

          {detailError && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{detailError}
              <button onClick={load} className="ml-auto underline text-xs">Retry</button>
            </div>
          )}

          {/* Header card */}
          <div className="gv-card flex flex-col gap-5"
            style={{ background: 'linear-gradient(135deg,rgba(30,42,58,0.95) 0%,rgba(20,32,46,0.95) 100%)' }}>
            <div className="flex items-start justify-between gap-4">
              {loadingDetail
                ? <div className="h-9 w-64 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                : <h1 className="text-3xl font-bold text-white leading-tight">{detail?.name ?? site.name}</h1>}
              <span className={`text-sm font-semibold px-4 py-1.5 rounded-full flex-shrink-0 ${siteMeta.bg} ${siteMeta.color}`}>
                {siteMeta.label}
              </span>
            </div>
            {loadingDetail ? (
              <div className="grid grid-cols-2 gap-3">
                {[70,55,65,50].map((w,i) => (
                  <div key={i} className="h-5 rounded animate-pulse"
                    style={{ background: 'var(--gv-glass-bg-strong)', width: `${w}%` }} />
                ))}
              </div>
            ) : detail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detail.location && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" /><span>{detail.location}</span>
                  </div>
                )}
                {detail.description && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    <FileText className="w-4 h-4 flex-shrink-0" /><span>{detail.description}</span>
                  </div>
                )}
                {(detail.createdAt || detail.completionDate) && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {detail.createdAt ? `Started ${format(new Date(detail.createdAt), 'dd MMM yyyy')}` : ''}
                      {detail.completionDate ? ` · Deadline ${format(new Date(detail.completionDate), 'dd MMM yyyy')}` : ''}
                    </span>
                  </div>
                )}
                {detail.tendererName && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    <Briefcase className="w-4 h-4 flex-shrink-0" /><span>Tenderer: {detail.tendererName}</span>
                  </div>
                )}
                {detail.inquiringEntity && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    <Building2 className="w-4 h-4 flex-shrink-0" /><span>Inquiring: {detail.inquiringEntity}</span>
                  </div>
                )}
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--gv-glass-border)', paddingTop: '1.25rem' }}>
              <p className="gv-label">Estimated Value</p>
              <p className="text-3xl font-bold text-white">KSH {ESTIMATED_VALUE.toLocaleString()}.00</p>
            </div>
          </div>

          {/* Project Overview — 4 cols, last = Estimated Value */}
          <section>
            <p className="text-xl font-semibold text-white mb-4">Project Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="gv-card flex flex-col gap-1">
                <p className="gv-label">Total Workers</p>
                {loadingWorkers ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  : <p className="text-4xl font-bold text-white">{workers.length}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Overall headcount</p>
              </div>
              <div className="gv-card flex flex-col gap-1">
                <p className="gv-label">Completion Rate</p>
                {loadingTasks ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  : <p className="text-4xl font-bold text-white">{completionRate}%</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Based on subtasks</p>
              </div>
              <div className="gv-card flex flex-col gap-1">
                <p className="gv-label">Tasks Completed</p>
                {loadingTasks ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  : <p className="text-4xl font-bold text-white">{tasksCompleted}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{tasksCompleted} of {tasks.length} tasks</p>
              </div>
              {/* Last card = Estimated Value, NOT time elapsed */}
              <div className="gv-card flex flex-col gap-1">
                <p className="gv-label">Estimated Value</p>
                <p className="text-2xl font-bold text-white leading-tight">KSH {ESTIMATED_VALUE.toLocaleString()}.00</p>
                <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Total budget</p>
              </div>
            </div>
          </section>

          {/* Financials */}
          <section>
            <p className="text-xl font-semibold text-white mb-4">Financials</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: DollarSign, label: 'Estimated Value',     value: `KSH ${ESTIMATED_VALUE.toLocaleString()}.00`, sub: 'Total project budget',             loading: false             },
                { icon: Receipt,    label: 'Project Expenditure',  value: `KSH ${expenditure.toLocaleString()}.00`,     sub: 'Invoices + tool hire costs',        loading: loadingFinancials },
                { icon: PiggyBank,  label: 'Available Budget',     value: `KSH ${availableBudget.toLocaleString()}.00`, sub: 'Estimated value minus expenditure', loading: loadingFinancials },
              ].map((card) => (
                <div key={card.label} className="gv-card flex items-center gap-4">
                  <div className="gv-icon-box flex-shrink-0">
                    <card.icon className="w-5 h-5" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="gv-label">{card.label}</p>
                    {card.loading
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-xl font-bold text-white">{card.value}</p>}
                    <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Visual Metrics — two gauges left and right with a divider, larger circles */}
          <section>
            <p className="text-xl font-semibold text-white mb-4">Visual Metrics</p>
            <div className="gv-card">
              <div className="flex items-start gap-0">
                {/* Left: Project Completion */}
                <div className="flex-1 flex flex-col items-center px-6 py-2">
                  <ProjectCompletionGauge taskPct={completionRate} timePct={timePct} />
                </div>
                {/* Vertical divider */}
                <div className="self-stretch w-px my-4" style={{ background: 'var(--gv-glass-border)' }} />
                {/* Right: Weekly Attendance */}
                <div className="flex-1 flex flex-col items-center px-6 py-2">
                  <WeeklyAttendanceGauge avgPresent={avgPresent} target={TARGET_PER_DAY} />
                </div>
              </div>
            </div>
          </section>

          {/* Task Breakdown & Workers — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <section>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xl font-semibold text-white">Task Breakdown</p>
                <button className="gv-btn-pill text-xs"
                  style={{ color: 'var(--gv-brand)', borderColor: 'var(--gv-brand)' }}>
                  + Add Task
                </button>
              </div>
              {tasksError ? (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{tasksError}
                  <button onClick={load} className="ml-auto underline text-xs">Retry</button>
                </div>
              ) : loadingTasks ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                </div>
              ) : tasks.length === 0 ? (
                <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                  <ClipboardList className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                  <p className="text-sm text-white">No tasks yet</p>
                  <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Add tasks to track progress</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map((task) => <TaskAccordionRow key={task.id} task={task} />)}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xl font-semibold text-white">Workers on Site</p>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
                  <Download className="w-3.5 h-3.5" style={{ color: 'var(--gv-text-muted)' }} />
                </button>
              </div>

              {/* Always-visible calendar date pickers — clicking either input opens the native calendar */}
              <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
                style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />
                  <p className="text-sm font-semibold text-white">Select Date Range</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--gv-text-subtle)' }}>From</label>
                    <input
                      type="date"
                      value={rangeFrom}
                      max={rangeTo || undefined}
                      onChange={(e) => setRangeFrom(e.target.value)}
                      className="gv-input text-sm py-2 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--gv-text-subtle)' }}>To</label>
                    <input
                      type="date"
                      value={rangeTo}
                      min={rangeFrom || undefined}
                      onChange={(e) => setRangeTo(e.target.value)}
                      className="gv-input text-sm py-2 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                {/* Quick preset buttons */}
                <div className="flex gap-2 pt-1">
                  {[
                    { label: 'Today',    days: 0  },
                    { label: 'Last 7d',  days: 7  },
                    { label: 'Last 30d', days: 30 },
                  ].map((p) => {
                    const t = format(new Date(), 'yyyy-MM-dd');
                    const f = p.days === 0 ? t : format(new Date(Date.now() - p.days * 86_400_000), 'yyyy-MM-dd');
                    const isActive = rangeFrom === f && rangeTo === t;
                    return (
                      <button key={p.label}
                        onClick={() => { setRangeFrom(f); setRangeTo(t); }}
                        className="text-xs px-3 py-1.5 rounded-full flex-1 transition-all"
                        style={{
                          background: isActive ? 'var(--gv-brand)' : 'var(--gv-glass-bg-strong)',
                          border: `1px solid ${isActive ? 'var(--gv-brand)' : 'var(--gv-glass-border)'}`,
                          color: isActive ? 'white' : 'var(--gv-text-muted)',
                        }}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
                  Showing: {rangeLabel}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="gv-card flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--gv-brand)' }}>
                    <Users className="w-3.5 h-3.5" />Present
                  </div>
                  {loadingAttendance ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-4xl font-bold text-white">{presentCount}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>for {rangeLabel}</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#f87171' }}>
                    <TrendingUp className="w-3.5 h-3.5" />Payouts
                  </div>
                  {loadingAttendance ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-2xl font-bold text-white">KES {totalPayouts.toLocaleString()}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>auto-calculated</p>
                </div>
              </div>
              {(workersError || attendanceError) && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-3"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{workersError ?? attendanceError}
                  <button onClick={load} className="ml-auto underline text-xs">Retry</button>
                </div>
              )}
              {loadingAttendance ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                  <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                  <p className="text-sm text-white">No check-ins for this range</p>
                  <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Try a different date range</p>
                </div>
              ) : (
                <div className="gv-card" style={{ padding: '0 1rem' }}>
                  {filteredRecords.map((r) => <AttendanceRow key={r.id} record={r} />)}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConstructionSitesPage() {
  const [sites,         setSites        ] = useState<Site[]>([]);
  const [kpis,          setKpis         ] = useState<OverviewKPIs | null>(null);
  const [loadingSites,  setLoadingSites ] = useState(true);
  const [loadingKpis,   setLoadingKpis  ] = useState(true);
  const [sitesError,    setSitesError   ] = useState<string | null>(null);
  const [search,        setSearch       ] = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [selectedSite,  setSelectedSite ] = useState<Site | null>(null);

  const load = useCallback(() => {
    setLoadingSites(true); setSitesError(null);
    fetchSites()
      .then((data) => {
        // DEBUG — remove after confirming status values are correct
        console.log('[Sites] raw site_status values:', data.map((s) => ({ id: s.id, name: s.name, site_status: s.site_status })));
        setSites(data);
      })
      .catch((err: unknown) =>
        setSitesError(err instanceof Error ? err.message : 'Failed to load sites'))
      .finally(() => setLoadingSites(false));

    setLoadingKpis(true);
    fetchOverviewKPIs()
      .then((res) => { const d = (res as any).data ?? res; setKpis(d as OverviewKPIs); })
      .catch(() => {})
      .finally(() => setLoadingKpis(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (selectedSite) {
    return <SiteDetailView site={selectedSite} onBack={() => setSelectedSite(null)} />;
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
        <h1 className="text-2xl font-bold text-white">Construction Sites</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
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
                className="text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
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
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{sitesError}
          <button onClick={load} className="ml-auto underline text-xs">Retry</button>
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
          <p className="text-sm font-medium text-white">
            {sites.length === 0 ? 'No sites yet' : 'No results found'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>
            {sites.length === 0 ? 'Create your first project to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {filtered.map((site) => (
            <SiteCard key={site.id} site={site} onClick={() => setSelectedSite(site)} />
          ))}
        </div>
      )}
    </div>
  );
}