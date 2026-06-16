'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

import { format, parseISO, subDays, differenceInCalendarDays } from 'date-fns';
import api from '@/lib/api';
import {
  Site, ProjectStatus, SiteStatus, OverviewKPIs,
  SiteDetail, SiteWorker, AttendanceRecord, SiteTask,
} from '@/types/site';
import {
  Search, Calendar, Building2, AlertCircle, Loader2,
  FileText, Briefcase, Users, ClipboardList, UserCheck,
  ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Circle,
  AlertTriangle, RefreshCw, DollarSign, TrendingUp,
  Download, PiggyBank, Receipt, X, MapPin, CalendarRange, ArrowLeft,
} from 'lucide-react';

interface RawSite {
  id: number;
  name: string;
  location?: string;
  projectStatus?: string;
  siteStatus?: string;
  deadlineDate?: string;
  [key: string]: unknown;
}

interface AttendanceSummary {
  site_id?: number;
  start_date?: string;
  end_date?: string;
  total?: number;
  payouts?: number;
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
  if (Array.isArray((obj as any).records)) return obj as unknown as AttendanceSummary;
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
  ACTIVE:   { label: 'Active',   color: 'text-green-300', bg: 'bg-green-500/20 border border-green-500/40'  },
  INACTIVE: { label: 'Inactive', color: 'text-gray-300',  bg: 'bg-gray-500/20 border border-gray-500/40'   },
  CLOSED:   { label: 'Closed',   color: 'text-red-300',   bg: 'bg-red-500/20 border border-red-500/40'     },
};

function normSiteStatus(s: unknown): SiteStatus {
  switch (String(s ?? '').toLowerCase()) {
    case 'active':   return 'ACTIVE';
    case 'inactive': return 'INACTIVE';
    case 'closed':   return 'CLOSED';
    default:         return 'INACTIVE';
  }
}

function normProjectStatus(s: unknown): ProjectStatus {
  switch (String(s ?? '').toLowerCase().replace(/[\s-]+/g, '_')) {
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

function SiteCard({ site, onClick }: { site: RawSite; onClick: () => void }) {
  const ss       = normSiteStatus(site.siteStatus);
  const siteMeta = SITE_STATUS_META[ss];

  return (
    <div
      onClick={onClick}
      className="gv-card flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-lg text-white leading-tight">{site.name}</p>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0 ${siteMeta.bg} ${siteMeta.color}`}>
          {siteMeta.label}
        </span>
      </div>
      {site.deadlineDate && (
        <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Deadline: {site.deadlineDate}</span>
        </div>
      )}
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
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="#ef4444" strokeWidth={SW}
          strokeDasharray={`${(timePct / 100) * outerCirc} ${outerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${(taskPct / 100) * innerCirc} ${innerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="22" fontWeight="700" fill="white">{taskPct}%</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)">tasks done</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />Task completion ({taskPct}%)
        </span>
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-red-500" />Time elapsed ({timePct}%)
        </span>
      </div>
      <p className="text-sm font-semibold text-white mt-3 text-center">Project Completion</p>
    </div>
  );
}

function WeeklyAttendanceGauge({
  avgPerWeek,
  target,
  totalCheckIns,
}: {
  avgPerWeek: number;
  target: number;
  totalCheckIns: number;
}) {
  const CX = 110, CY = 110, R = 88, SW = 18;
  const circ        = 2 * Math.PI * R;
  const maxVal      = Math.max(target, avgPerWeek, 1);
  const presentDash = (Math.min(avgPerWeek, maxVal) / maxVal) * circ;

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220, height: 'auto' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ef4444" strokeWidth={SW}
          strokeDasharray={`${circ} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${presentDash} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="26" fontWeight="700" fill="white">
          {avgPerWeek % 1 === 0 ? avgPerWeek : avgPerWeek.toFixed(1)}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)">avg/week</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />
          Avg check-ins/week ({avgPerWeek % 1 === 0 ? avgPerWeek : avgPerWeek.toFixed(1)})
        </span>
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-red-500" />
          Target: {target} workers/day
        </span>
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-500" />
          Total check-ins (last 7d): {totalCheckIns}
        </span>
      </div>
      <p className="text-sm font-semibold text-white mt-3 text-center">Weekly Attendance</p>
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
  const checkInDate =
    safeFormat(record.checkInTime, 'dd MMM yyyy, hh:mm aa') ??
    safeFormat(record.date,        'dd MMM yyyy') ??
    '—';

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

// ─── All Workers Full-Screen Panel ────────────────────────────────────────────
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
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: 'var(--gv-bg-gradient)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{
          background: 'var(--gv-nav-bg)',
          borderBottom: '1px solid var(--gv-glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--gv-brand)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex-1 text-center">
          <p className="text-base font-bold text-white">Workers on Site</p>
          <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>{dateLabel}</p>
        </div>
        <span className="w-16" />
      </div>

      {/* Count badge */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907C' }}
        >
          <Users className="w-4 h-4" />
          {records.length} worker{records.length !== 1 ? 's' : ''} checked in
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
            <p className="text-sm text-white">No check-ins for this period</p>
          </div>
        ) : (
          <div className="gv-card" style={{ padding: '0 1rem' }}>
            {records.map((r) => (
              <AttendanceRow key={r.id} record={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────
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

  function handleOpen() {
    setDraftFrom(from);
    setDraftTo(to);
    setOpen(true);
  }

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
    { label: 'Today',         f: format(today, 'yyyy-MM-dd'),             t: format(today, 'yyyy-MM-dd') },
    { label: 'Yesterday',     f: format(subDays(today, 1), 'yyyy-MM-dd'), t: format(subDays(today, 1), 'yyyy-MM-dd') },
    { label: 'Last 7 days',   f: format(subDays(today, 6), 'yyyy-MM-dd'), t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 30 days',  f: format(subDays(today, 29), 'yyyy-MM-dd'),t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 3 months', f: format(subDays(today, 89), 'yyyy-MM-dd'),t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 6 months', f: format(subDays(today, 179), 'yyyy-MM-dd'),t: format(today, 'yyyy-MM-dd') },
  ];

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span>{label}</span>
        </div>
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl"
          style={{ color: 'var(--gv-brand)', background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
          <CalendarRange className="w-4 h-4" />
          Pick Range
        </button>
      </div>

      {open && (
        <div
          className="absolute right-0 z-50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
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
                <button
                  key={p.label}
                  onClick={() => { setDraftFrom(p.f); setDraftTo(p.t); }}
                  className="text-xs px-2 py-1.5 rounded-xl text-left"
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
              <label className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>From</label>
              <input
                type="date"
                value={draftFrom}
                max={maxDate}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="gv-input text-sm py-2 w-full cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>To</label>
              <input
                type="date"
                value={draftTo}
                min={draftFrom}
                max={maxDate}
                onChange={(e) => setDraftTo(e.target.value)}
                className="gv-input text-sm py-2 w-full cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="flex-1 text-sm py-2 rounded-xl"
              style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 text-sm py-2 rounded-xl font-semibold text-white"
              style={{ background: 'var(--gv-brand)' }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SiteDetailView ───────────────────────────────────────────────────────────
function SiteDetailView({ site, onBack }: { site: RawSite; onBack: () => void }) {

  useEffect(() => {
    const sidebar = document.querySelector('aside') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    return () => { if (sidebar) sidebar.style.display = ''; };
  }, []);

  const [detail,        setDetail    ] = useState<SiteDetail | null>(null);
  const [workers,       setWorkers   ] = useState<SiteWorker[]>([]);
  const [tasks,         setTasks     ] = useState<SiteTask[]>([]);
  const [invoices,      setInvoices  ] = useState<Invoice[]>([]);
  const [storeTools,    setStoreTools] = useState<StoreTool[]>([]);

  const [weeklyRecords, setWeeklyRecords] = useState<AttendanceRecord[]>([]);
  const [rangeRecords,  setRangeRecords ] = useState<AttendanceRecord[]>([]);
  const [rangePayouts,  setRangePayouts ] = useState<number>(0);

  const [loadingDetail,     setLoadingDetail    ] = useState(true);
  const [loadingWorkers,    setLoadingWorkers   ] = useState(true);
  const [loadingTasks,      setLoadingTasks     ] = useState(true);
  const [loadingFinancials, setLoadingFinancials] = useState(true);
  const [loadingWeekly,     setLoadingWeekly    ] = useState(true);
  const [loadingRange,      setLoadingRange     ] = useState(true);

  const [detailError, setDetailError] = useState<string | null>(null);

  // ── "View All Workers" overlay ──
  const [showAllWorkers, setShowAllWorkers] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Default range = today only (web)
  const [rangeFrom, setRangeFrom] = useState(todayStr);
  const [rangeTo,   setRangeTo  ] = useState(todayStr);

  const loadStatic = useCallback(() => {
    setLoadingDetail(true); setDetailError(null);
    api.get(`/sites/${site.id}`)
      .then(({ data }) => setDetail(unwrapObject<SiteDetail>(data)))
      .catch(() => setDetailError('Failed to load site details.'))
      .finally(() => setLoadingDetail(false));

    setLoadingWorkers(true);
    api.get(`/workers/list-by-id/${site.id}`)
      .then(({ data }) => setWorkers(unwrapItems<SiteWorker>(data)))
      .catch(() => setWorkers([]))
      .finally(() => setLoadingWorkers(false));

    setLoadingTasks(true);
    api.get(`/tasks/list/${site.id}`)
      .then(({ data }) => setTasks(unwrapItems<SiteTask>(data)))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));

    setLoadingFinancials(true);
    Promise.allSettled([
      api.get('/invoices/all'),
      api.get(`/store/tools/${site.id}/all`),
    ]).then(([invRes, toolRes]) => {
      if (invRes.status  === 'fulfilled') setInvoices(unwrapItems<Invoice>(invRes.value.data));
      if (toolRes.status === 'fulfilled') setStoreTools(unwrapItems<StoreTool>(toolRes.value.data));
    }).finally(() => setLoadingFinancials(false));
  }, [site.id]);

  const loadWeekly = useCallback(() => {
    const from = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    setLoadingWeekly(true);
    api.get('/attendance/summary', {
      params: { site_id: site.id, start_date: from, end_date: format(new Date(), 'yyyy-MM-dd') },
    })
      .then(({ data }) => {
        const summary = unwrapAttendanceSummary(data);
        setWeeklyRecords(summary?.records ?? []);
      })
      .catch(() => setWeeklyRecords([]))
      .finally(() => setLoadingWeekly(false));
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
      .catch(() => {
        setRangeRecords([]);
        setRangePayouts(0);
      })
      .finally(() => setLoadingRange(false));
  }, [site.id]);

  useEffect(() => {
    loadStatic();
    loadWeekly();
  }, [loadStatic, loadWeekly]);

  useEffect(() => {
    loadRange(rangeFrom, rangeTo);
  }, [rangeFrom, rangeTo, loadRange]);

  // ── derived metrics ──
  const weeklyTotal  = weeklyRecords.length;
  const avgPerWeek   = +(weeklyTotal / 7).toFixed(1);
  const targetPerDay = workers.length;

  const totalSubtasks  = tasks.reduce((a, t) => a + (t.subtasks?.length ?? 0), 0);
  const doneSubtasks   = tasks.reduce((a, t) =>
    a + (t.subtasks?.filter((s) => ['completed','done'].includes((s.status ?? '').toLowerCase())).length ?? 0), 0);
  const completionRate = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;
  const tasksCompleted = tasks.filter((t) => ['completed','done'].includes((t.status ?? '').toLowerCase())).length;

  const timePct = (() => {
    try {
      const created = detail?.createdAt ? new Date(detail.createdAt) : null;
      if (!created || isNaN(created.getTime())) return 0;
      const deadline = detail?.completionDate ? new Date(detail.completionDate) : null;
      if (deadline && !isNaN(deadline.getTime()) && deadline > created) {
        const total   = deadline.getTime() - created.getTime();
        const elapsed = Date.now()         - created.getTime();
        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
      }
      const daysSince = differenceInCalendarDays(new Date(), created);
      return Math.min(100, Math.round((daysSince / 365) * 100));
    } catch { return 0; }
  })();

  const estimatedValue  = (detail as any)?.estimatedValue  ?? (detail as any)?.estimated_value  ?? 0;
  const invoiceTotal    = invoices.reduce((acc, inv) => acc + (inv.total_amount ?? inv.amount ?? 0), 0);
  const toolTotal       = storeTools.reduce((acc, t) => acc + (t.hire_cost ?? t.cost ?? t.amount ?? 0), 0);
  const expenditure     = invoiceTotal + toolTotal;
  const availableBudget = Math.max(0, estimatedValue - expenditure);

  const fmtKes = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const ss       = normSiteStatus(detail?.siteStatus ?? site.siteStatus);
  const siteMeta = SITE_STATUS_META[ss];

  const rangeDateLabel = rangeFrom === rangeTo
    ? format(parseISO(rangeFrom), 'dd MMM yyyy')
    : `${format(parseISO(rangeFrom), 'dd MMM')} – ${format(parseISO(rangeTo), 'dd MMM yyyy')}`;

  // Sliced list for the inline preview (max 5)
  const PREVIEW_LIMIT  = 5;
  const previewRecords = rangeRecords.slice(0, PREVIEW_LIMIT);
  const hasMore        = rangeRecords.length > PREVIEW_LIMIT;

  return (
    <>
      {/* Full-screen all-workers overlay */}
      {showAllWorkers && (
        <AllWorkersScreen
          records={rangeRecords}
          dateLabel={rangeDateLabel}
          onClose={() => setShowAllWorkers(false)}
        />
      )}

      <div className="w-full" style={{ background: 'var(--gv-bg-gradient)', minHeight: '100vh' }}>

        {/* Fixed nav bar */}
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

        <div className="mx-auto pt-20 pb-20" style={{ width: '80%' }}>
          <div className="flex flex-col gap-8">

            {detailError && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{detailError}
                <button onClick={loadStatic} className="ml-auto underline text-xs">Retry</button>
              </div>
            )}

            {/* Site header card */}
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
                        {detail.createdAt ? `Started ${detail.createdAt}` : ''}
                        {detail.completionDate ? ` · Deadline ${detail.completionDate}` : ''}
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
                      <Building2 className="w-4 h-4 flex-shrink-0" /><span>Procuring entity: {detail.inquiringEntity}</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--gv-glass-border)', paddingTop: '1.25rem' }}>
                <p className="gv-label">Estimated Value</p>
                {loadingDetail
                  ? <div className="h-8 w-40 rounded animate-pulse mt-1" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <p className="text-3xl font-bold text-white">{fmtKes(estimatedValue)}</p>}
              </div>
            </div>

            {/* Project Overview */}
            <section>
              <p className="text-xl font-semibold text-white mb-4">Project Overview</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Total Workers</p>
                  {loadingWorkers
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-4xl font-bold text-white">{workers.length}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Overall headcount</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Completion Rate</p>
                  {loadingTasks
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-4xl font-bold text-white">{completionRate}%</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Based on subtasks from DB</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Tasks Completed</p>
                  {loadingTasks
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-4xl font-bold text-white">{tasksCompleted}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{tasksCompleted} of {tasks.length} tasks</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Estimated Value</p>
                  {loadingDetail
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-xl font-bold text-white leading-tight">{fmtKes(estimatedValue)}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Total budget</p>
                </div>
              </div>
            </section>

            {/* Financials */}
            <section>
              <p className="text-xl font-semibold text-white mb-4">Financials</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: DollarSign, label: 'Estimated Value',    value: fmtKes(estimatedValue),  sub: 'Total project budget',             loading: loadingDetail },
                  { icon: Receipt,    label: 'Project Expenditure', value: fmtKes(expenditure),     sub: 'Invoices + tool hire costs',        loading: loadingFinancials },
                  { icon: PiggyBank,  label: 'Available Budget',    value: fmtKes(availableBudget), sub: 'Estimated value minus expenditure', loading: loadingFinancials || loadingDetail },
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

            {/* Visual Metrics */}
            <section>
              <p className="text-xl font-semibold text-white mb-4">Visual Metrics</p>
              <div className="gv-card">
                {(loadingTasks || loadingWeekly || loadingWorkers || loadingDetail) ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>Loading metrics…</span>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="flex-1 flex flex-col items-center px-6 py-2">
                      <ProjectCompletionGauge taskPct={completionRate} timePct={timePct} />
                    </div>
                    <div className="self-stretch w-px my-4" style={{ background: 'var(--gv-glass-border)' }} />
                    <div className="flex-1 flex flex-col items-center px-6 py-2">
                      <WeeklyAttendanceGauge
                        avgPerWeek={avgPerWeek}
                        target={targetPerDay}
                        totalCheckIns={weeklyTotal}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Task Breakdown + Workers on Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-semibold text-white">Task Breakdown</p>
                </div>
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                    <ClipboardList className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                    <p className="text-sm text-white">No tasks yet</p>
                    <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Tasks assigned to this site will appear here</p>
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

                <DateRangePicker
                  from={rangeFrom}
                  to={rangeTo}
                  maxDate={todayStr}
                  onChange={(f, t) => {
                    setRangeFrom(f);
                    setRangeTo(t);
                  }}
                />

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--gv-brand)' }}>
                      <Users className="w-3.5 h-3.5" />Present
                    </div>
                    {loadingRange
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-4xl font-bold text-white">{rangeRecords.length}</p>}
                    <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{rangeDateLabel}</p>
                  </div>
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#f87171' }}>
                      <TrendingUp className="w-3.5 h-3.5" />Payouts
                    </div>
                    {loadingRange
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-2xl font-bold text-white">{fmtKes(rangePayouts)}</p>}
                    <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}></p>
                  </div>
                </div>

                {/* Attendance records — preview (max 5) */}
                {loadingRange ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                ) : rangeRecords.length === 0 ? (
                  <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                    <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                    <p className="text-sm text-white">No check-ins for {rangeDateLabel}</p>
                    <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Try a different date range</p>
                  </div>
                ) : (
                  <>
                    <div className="gv-card" style={{ padding: '0 1rem' }}>
                      {previewRecords.map((r) => <AttendanceRow key={r.id} record={r} />)}
                    </div>

                    {hasMore && (
                      <button
                        onClick={() => setShowAllWorkers(true)}
                        className="mt-3 w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
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

// ─── ConstructionSitesPage ────────────────────────────────────────────────────
const LS_KEY = 'gv_selected_site';

export default function ConstructionSitesPage() {
  const [sites,         setSites        ] = useState<RawSite[]>([]);
  const [kpis,          setKpis         ] = useState<OverviewKPIs | null>(null);
  const [loadingSites,  setLoadingSites ] = useState(true);
  const [loadingKpis,   setLoadingKpis  ] = useState(true);
  const [sitesError,    setSitesError   ] = useState<string | null>(null);
  const [search,        setSearch       ] = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  // ── localStorage-driven site selection ──
  // Read synchronously in useState initialiser so the correct view renders
  // on the very first paint — no flicker, no spinner, no flash of the list.
  const [selectedSite, setSelectedSite] = useState<RawSite | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as RawSite) : null;
    } catch {
      return null;
    }
  });

  const load = useCallback(() => {
    setLoadingSites(true); setSitesError(null);
    api.get('/sites/list')
      .then(({ data }) => setSites(unwrapItems<RawSite>(data)))
      .catch((err: unknown) =>
        setSitesError(err instanceof Error ? err.message : 'Failed to load sites'))
      .finally(() => setLoadingSites(false));

    setLoadingKpis(true);
    api.get('/analytics/overview')
      .then(({ data }) => { const d = (data as any)?.data ?? data; setKpis(d as OverviewKPIs); })
      .catch(() => {})
      .finally(() => setLoadingKpis(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Navigate to detail: persist full site object so refresh restores instantly
  function openSite(site: RawSite) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(site)); } catch {}
    setSelectedSite(site);
  }

  // Navigate back to list: clear persisted selection
  function closeSite() {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setSelectedSite(null);
  }

  // Show detail view — renders immediately on refresh with zero flicker
  if (selectedSite) {
    return <SiteDetailView site={selectedSite} onBack={closeSite} />;
  }

  const totalSites    = kpis?.totalSites    ?? sites.length;
  const planningSites = kpis?.planningSites ?? sites.filter((s) => normProjectStatus(s.projectStatus) === 'PLANNING').length;
  const activeSites   = kpis?.activeSites   ?? sites.filter((s) => normSiteStatus(s.siteStatus) === 'ACTIVE').length;
  const pausedSites   = sites.filter((s) => normProjectStatus(s.projectStatus) === 'ON_HOLD').length;
  const doneSites     = sites.filter((s) => normProjectStatus(s.projectStatus) === 'COMPLETED').length;

  const filtered = sites.filter((s) => {
    const q           = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || (s.location ?? '').toLowerCase().includes(q);
    const matchProj   = projectFilter === 'ALL' || normProjectStatus(s.projectStatus) === projectFilter;
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
          <QuickStatPill label="Total"  value={totalSites}    loading={loadingKpis && loadingSites} />
          <QuickStatPill label="Plan"   value={planningSites} loading={loadingKpis && loadingSites} />
          <QuickStatPill label="Active" value={activeSites}   loading={loadingKpis && loadingSites} />
          <QuickStatPill label="Done"   value={doneSites}     loading={loadingSites} />
          <QuickStatPill label="Paused" value={pausedSites}   loading={loadingSites} />
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
                className="text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all"
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
            <div key={i} className="h-24 rounded-2xl animate-pulse"
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
            <SiteCard key={site.id} site={site} onClick={() => openSite(site)} />
          ))}
        </div>
      )}
    </div>
  );
}