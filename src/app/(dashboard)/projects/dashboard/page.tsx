'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import {
  Building2, Users, ClipboardList, ShoppingCart,
  Shield, UserCheck, Loader2, RefreshCw,
  ChevronLeft, ChevronRight as ChevronRightIcon, Calendar,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface DashboardMetrics {
  sites: number;
  workers: number;
  tasks: {
    totalTasks: number;
    completedTasks: number;
    taskCompletionPercentage: number;
  };
  expenditure: {
    supplier: number;
    subcontractor: number;
    total: number;
  };
  totalPermits: number;
  attendancePercentageToday: number;
  projectStatus: {
    planning: number;
    inProgress: number;
    onHold: number;
    completed: number;
    cancelled: number;
  };
  permits: {
    pending: number;
    approved: number;
    rejected: number;
  };
  materials: {
    totalMaterials: number;
    totalTools: number;
    toolsOnHire: number;
    toolsInRepair: number;
    sitesWithLowStocks: number;
  };
  orders: {
    totalOrders: number;
    orderBreakdown: Array<{
      site?: string; site_name?: string;
      item?: string; item_name?: string; material_name?: string; material?: string;
      quantity?: number;
      unit?: string;
    }>;
  };
}

interface AttendanceDay {
  date: string;
  present_count: number;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function toISO(d: Date) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtKsh(n: number): string {
  if (n >= 1_000_000) return `KSH ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `KSH ${Math.round(n / 1_000)}k`;
  return `KSH ${n.toLocaleString()}`;
}

function normaliseAnalyticsResponse(raw: unknown): AttendanceDay[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  let arr: unknown[] = [];
  if (Array.isArray(obj.data)) arr = obj.data;
  else if (Array.isArray(raw)) arr = raw as unknown[];
  return arr
    .map((row: any) => ({
      date: String(row.date ?? row.attendance_date ?? ''),
      present_count: Number(
        row.attendance_count ?? row.present_count ?? row.present ??
        row.count ?? row.workers_present ?? row.total_present ?? row.total ?? 0,
      ),
    }))
    .filter(r => r.date !== '' && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}

async function fetchAttendanceAnalytics(startDate: string, endDate: string): Promise<AttendanceDay[]> {
  try {
    const res = await api.get('/attendance/analytics', {
      params: { start_date: startDate, end_date: endDate },
    });
    return normaliseAnalyticsResponse(res.data);
  } catch (err) {
    console.warn('[Attendance/analytics] fetch error:', err);
    return [];
  }
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await api.get('/sites/dashboard-metrics');
  const d = (res.data as any)?.data ?? res.data;
  return d as DashboardMetrics;
}

/* ─────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, loading }: {
  label: string; value: React.ReactNode; sub?: string;
  icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl p-4"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
        <p className="text-base" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
      </div>
      {loading
        ? <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-4xl font-bold text-white leading-none">{value}</p>}
      {sub && <p className="text-base" style={{ color: 'var(--gv-text-subtle)' }}>{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section title
───────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-2xl font-bold text-white mb-3">{children}</p>;
}

/* ─────────────────────────────────────────────
   Status Card (for Project Status grid)
───────────────────────────────────────────── */
function StatusCard({ label, value, color, loading }: {
  label: string; value: number; color: string; loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl p-4 gap-1"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', minHeight: 80 }}>
      {loading
        ? <div className="h-7 w-8 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-4xl font-bold" style={{ color }}>{value}</p>}
      <p className="text-base text-center" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Calendar Picker
───────────────────────────────────────────── */
function CalendarPicker({
  dateFrom, dateTo, onSelect, onClose, constrainWidth, anchorRef,
}: {
  dateFrom: string; dateTo: string;
  onSelect: (from: string, to: string) => void;
  onClose: () => void;
  constrainWidth?: boolean;
  anchorRef?: React.RefObject<HTMLElement>;
}) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [hoverDate, setHoverDate] = useState<string>('');

  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate   = dateTo   ? new Date(dateTo)   : null;

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const [maxW, setMaxW] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (constrainWidth && anchorRef?.current) {
      setMaxW(anchorRef.current.getBoundingClientRect().width);
    }
  }, [constrainWidth, anchorRef]);

  function getDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMo = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= daysInMo; d++) days.push(new Date(year, month, d));
    return days;
  }

  const days = getDaysInMonth(viewYear, viewMonth);

  function handleDayClick(date: Date) {
    const iso = toISO(date);
    if (selecting === 'from') { onSelect(iso, ''); setSelecting('to'); }
    else {
      if (fromDate && date < fromDate) onSelect(iso, dateFrom);
      else onSelect(dateFrom, iso);
      setSelecting('from');
    }
  }

  function inRange(date: Date) {
    if (!fromDate) return false;
    const end = toDate ?? (hoverDate ? new Date(hoverDate) : null);
    if (!end) return false;
    const [lo, hi] = fromDate <= end ? [fromDate, end] : [end, fromDate];
    return date > lo && date < hi;
  }

  function isSelected(date: Date) {
    const iso = toISO(date);
    return iso === dateFrom || iso === dateTo;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  while (weeks[weeks.length - 1]?.length < 7) weeks[weeks.length - 1].push(null);

  return (
    <div
      className="absolute z-50 rounded-2xl shadow-2xl p-4 select-none"
      style={{
        background: 'rgba(18,20,30,0.98)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        top: '100%', left: 0, marginTop: 8,
        minWidth: 280,
        ...(maxW ? { width: maxW } : {}),
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-lg font-semibold text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ChevronRightIcon className="w-4 h-4 text-white" />
        </button>
      </div>

      <p className="text-base mb-2 text-center" style={{ color: 'var(--gv-text-muted)' }}>
        {selecting === 'from' ? 'Select start date' : 'Select end date'}
      </p>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-base font-medium py-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>{d}</div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((date, di) => {
            if (!date) return <div key={di} />;
            const selected    = isSelected(date);
            const inR         = inRange(date);
            const iso         = toISO(date);
            const isFrom      = iso === dateFrom;
            const isTo        = iso === dateTo;
            const isTodayDate = iso === toISO(today);
            return (
              <div key={di} className="flex items-center justify-center"
                style={{
                  height: 32,
                  background: inR ? 'rgba(59,130,246,0.15)' : 'transparent',
                  borderRadius: isFrom ? '8px 0 0 8px' : isTo ? '0 8px 8px 0' : 0,
                }}
                onMouseEnter={() => setHoverDate(iso)}
                onMouseLeave={() => setHoverDate('')}
                onClick={() => handleDayClick(date)}>
                <div className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all"
                  style={{
                    background: selected ? '#3b82f6' : 'transparent',
                    border: isTodayDate && !selected ? '1px solid rgba(59,130,246,0.5)' : 'none',
                  }}>
                  <span className="text-base font-medium"
                    style={{ color: selected ? '#fff' : isTodayDate ? '#7cb3f8' : 'rgba(255,255,255,0.8)' }}>
                    {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-base" style={{ color: 'var(--gv-text-muted)' }}>
          {dateFrom && <span>From: <span className="text-white">{dateFrom}</span></span>}
          {dateTo   && <span className="ml-2">To: <span className="text-white">{dateTo}</span></span>}
        </div>
        <button onClick={onClose} className="text-base px-3 py-1 rounded-lg"
          style={{ background: '#3b82f6', color: '#fff' }}>Done</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Attendance Bar Chart
───────────────────────────────────────────── */
interface Bar {
  label: string;
  fullLabel: string;
  date: string;
  dateDisplay: string;
  present: number;
}

function AttendanceBarChart({
  bars, loading, tab, activeBarIdx, onBarClick,
}: {
  bars: Bar[];
  loading: boolean;
  tab: 'Today' | 'Week' | 'Month' | 'Custom';
  activeBarIdx: number | null;
  onBarClick: (idx: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(400);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setW(Math.floor(w));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const maxData = Math.max(...bars.map(b => b.present), 1);

  function niceMax(v: number) {
    if (v === 0) return 5;
    if (v <= 5)  return 5;
    if (v <= 10) return 10;
    if (v <= 15) return 15;
    if (v <= 20) return 20;
    return Math.ceil(v / 5) * 5;
  }
  const yMax = niceMax(maxData);

  function getYTicks(max: number): number[] {
    if (max <= 5) return [0, 1, 2, 3, 4, 5].filter(t => t <= max);
    const step = max <= 10 ? 2 : max <= 20 ? 4 : 5;
    const ticks: number[] = [];
    for (let t = 0; t <= max; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
    return ticks;
  }
  const yTicks = getYTicks(yMax);

  const H = 185;
  const PL = 22, PB = 28, PT = 12, PR = 0;
  const cW = W - PL - PR;
  const cH = H - PB - PT;
  const count   = Math.max(bars.length, 1);
  const isWeek  = tab === 'Week';
  const isMonth = tab === 'Month';
  const gap  = cW / count;
  const barW = Math.max(3, Math.floor(gap) - (count > 20 ? 1 : count > 7 ? 4 : 10));

  if (loading) {
    return (
      <div ref={containerRef} className="flex items-center justify-center" style={{ height: H, width: '100%' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', width: '100%' }}
        onClick={() => { if (activeBarIdx !== null) onBarClick(null); }}>
        {yTicks.map((tick) => {
          const y = PT + cH - (tick / yMax) * cH;
          return (
            <g key={tick}>
              <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={2} y={y} textAnchor="start" dominantBaseline="central"
                fontSize="12" fontWeight="500" fill="rgba(255,255,255,0.45)" fontFamily="inherit">{tick}</text>
            </g>
          );
        })}
        {bars.map((b, i) => {
          const cx   = PL + i * gap + gap / 2;
          const x    = cx - barW / 2;
          const pH   = b.present > 0 ? (b.present / yMax) * cH : 0;
          const pY   = PT + cH - pH;
          const open = isWeek && activeBarIdx === i;
          return (
            <g key={i} style={{ cursor: isWeek ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (!isWeek) return;
                e.stopPropagation();
                onBarClick(open ? null : i);
              }}>
              <rect x={x - 4} y={PT} width={barW + 8} height={cH} fill="transparent" />
              {open && <rect x={x - 4} y={PT} width={barW + 8} height={cH} fill="rgba(255,255,255,0.06)" rx="3" />}
              {b.present > 0 && <rect x={x} y={pY} width={barW} height={pH} rx="2" fill="#3b82f6" opacity={open ? 1 : 0.85} />}
              <text x={cx} y={H - 6} textAnchor="middle"
                fontSize={isMonth ? 12 : 15}
                fontWeight={open ? '700' : '400'}
                fill={open ? '#fff' : 'rgba(255,255,255,0.55)'}
                fontFamily="inherit">{b.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function ProjectsDashboardPage() {
  const [metrics, setMetrics]         = useState<DashboardMetrics | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null); // kept for future use

  const [attendanceTab, setAttendanceTab] = useState<'Today' | 'Week' | 'Month' | 'Custom'>('Today');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [showCalendar, setShowCalendar]   = useState(false);

  const attendanceCardRef = useRef<HTMLDivElement>(null);
  const calendarRef       = useRef<HTMLDivElement>(null);
  const chartCardRef      = useRef<HTMLDivElement>(null);

  const [bars, setBars]               = useState<Bar[]>([]);
  const [loadingBars, setLoadingBars] = useState(false);
  const [barsError, setBarsError]     = useState<string | null>(null);
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);
  const [overlayPos, setOverlayPos]     = useState<{ top: number; left: number } | null>(null);

  const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DAY_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  /* Load dashboard metrics */
  const load = useCallback(() => {
    setLoading(true); setError(null);
    fetchDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.warn('[Dashboard] fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Attendance date range */
  function buildDateRange(tab: typeof attendanceTab): { from: string; to: string } | null {
    const now = new Date();
    if (tab === 'Today') { const iso = toISO(now); return { from: iso, to: iso }; }
    if (tab === 'Week') {
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: toISO(monday), to: toISO(sunday) };
    }
    if (tab === 'Month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toISO(first), to: toISO(last) };
    }
    if (tab === 'Custom') {
      if (!dateFrom || !dateTo) return null;
      const today  = toISO(new Date());
      const safeTo = dateTo > today ? today : dateTo;
      return { from: dateFrom, to: safeTo };
    }
    return null;
  }

  function buildBars(summary: AttendanceDay[], fromISO: string, toISO_: string, tab: typeof attendanceTab): Bar[] {
    const lookup: Record<string, number> = {};
    for (const row of summary) lookup[row.date] = row.present_count;
    const result: Bar[] = [];
    function parseLocalDate(iso: string): Date {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const cur = parseLocalDate(fromISO);
    const end = parseLocalDate(toISO_);
    const rangeDays = (end.getTime() - cur.getTime()) / 86400000;
    while (cur <= end) {
      const iso = toISO(cur);
      const dow = cur.getDay();
      const label =
        tab === 'Today'  ? 'Today' :
        tab === 'Week'   ? DAY_NAMES[dow] :
        tab === 'Custom' && rangeDays > 7
          ? `${cur.getDate()}/${cur.getMonth() + 1}`
          : tab === 'Custom' ? DAY_NAMES[dow]
          : String(cur.getDate());
      result.push({
        label,
        fullLabel:   DAY_FULL[dow],
        date:        iso,
        dateDisplay: cur.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        present:     lookup[iso] ?? 0,
      });
      cur.setDate(cur.getDate() + 1);
    }
    return result;
  }

  const loadBars = useCallback(async () => {
    const range = buildDateRange(attendanceTab);
    if (!range) { setBars([]); return; }
    setLoadingBars(true); setBarsError(null);
    try {
      const summary = await fetchAttendanceAnalytics(range.from, range.to);
      setBars(buildBars(summary, range.from, range.to, attendanceTab));
    } catch {
      setBarsError('Could not load attendance data.');
      setBars(buildBars([], range.from, range.to, attendanceTab));
    } finally {
      setLoadingBars(false);
    }
  }, [attendanceTab, dateFrom, dateTo]);

  useEffect(() => { setActiveBarIdx(null); loadBars(); }, [loadBars]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setShowCalendar(false);
    }
    if (showCalendar) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCalendar]);

  useEffect(() => {
    function handleClick() { setActiveBarIdx(null); setOverlayPos(null); }
    if (activeBarIdx !== null) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeBarIdx]);

  function handleBarClick(idx: number | null) {
    if (idx === null) { setActiveBarIdx(null); setOverlayPos(null); return; }
    setActiveBarIdx(idx);
    if (chartCardRef.current) {
      const rect     = chartCardRef.current.getBoundingClientRect();
      const count    = bars.length || 1;
      const fraction = (idx + 0.5) / count;
      setOverlayPos({ top: rect.top, left: rect.left + fraction * rect.width });
    }
  }

  /* Derived values */
  const m = metrics;
  const customLabel = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : 'Pick dates';
  const activeBar   = activeBarIdx !== null ? bars[activeBarIdx] : null;

  const PROJECT_STATUS_CONFIG = [
    { key: 'planning'   as const, label: 'Planning',    color: '#a78bfa' },
    { key: 'inProgress' as const, label: 'In Progress', color: '#3b82f6' },
    { key: 'onHold'     as const, label: 'On Hold',     color: '#eab308' },
    { key: 'completed'  as const, label: 'Completed',   color: '#22c55e' },
    { key: 'cancelled'  as const, label: 'Cancelled',   color: '#f87171' },
  ];

  return (
    <div className="gv-page-dashboard flex flex-col gap-0 overflow-y-auto pb-10">

      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Projects Dashboard</h1>
        <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--gv-brand)' }} />
            : <RefreshCw className="w-4 h-4" style={{ color: 'var(--gv-text-muted)' }} />}
        </button>
      </div>


      {/* ── Overview KPIs ── */}
      <div className="px-4 pb-5">
        <SectionTitle>Overview</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={Building2}     label="Total Sites"      loading={loading} value={m?.sites ?? 0}
            sub={`${m?.projectStatus?.inProgress ?? 0} in progress`} />
          <KpiCard icon={Users}         label="Workers"          loading={loading} value={m?.workers ?? 0} />
          <KpiCard icon={ClipboardList} label="Tasks"            loading={loading}
            value={`${m?.tasks?.completedTasks ?? 0}/${m?.tasks?.totalTasks ?? 0}`}
            sub={`${m?.tasks?.taskCompletionPercentage ?? 0}% done`} />
          <KpiCard icon={ShoppingCart}  label="Orders"           loading={loading} value={m?.orders?.totalOrders ?? 0} />
          <KpiCard icon={Shield}        label="Permits"          loading={loading} value={m?.totalPermits ?? 0}
            sub={`${m?.permits?.pending ?? 0} pending`} />
          <KpiCard icon={UserCheck}     label="Attendance Today" loading={loading}
            value={`${m?.attendancePercentageToday ?? 0}%`} />
        </div>
      </div>

      {/* ── Row 1: Attendance (left) | Project Status (right) ── */}
      <div className="px-4 pb-5 grid grid-cols-2 gap-3 items-start">

        {/* Attendance */}
        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Attendance</SectionTitle>
          <div ref={attendanceCardRef} className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['Today', 'Week', 'Month', 'Custom'] as const).map((t) => {
                const active = attendanceTab === t;
                return (
                  <button key={t}
                    onClick={() => { setAttendanceTab(t); if (t === 'Custom') setShowCalendar(true); }}
                    className="text-base font-medium px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
                    style={active
                      ? { background: 'var(--gv-brand)', color: '#fff' }
                      : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                    {t === 'Custom' && (dateFrom || dateTo) ? customLabel : t}
                  </button>
                );
              })}
            </div>

            {attendanceTab === 'Custom' && (
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setShowCalendar(v => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-base"
                  style={{
                    background: 'var(--gv-glass-bg)',
                    border: '1px solid var(--gv-glass-border)',
                    color: dateFrom ? '#fff' : 'var(--gv-text-muted)',
                  }}>
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />
                  <span className="truncate">
                    {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom ? `From ${dateFrom}` : 'Select range'}
                  </span>
                  <ChevronRightIcon className="w-3.5 h-3.5 ml-auto opacity-40 flex-shrink-0" />
                </button>
                {showCalendar && (
                  <CalendarPicker
                    dateFrom={dateFrom} dateTo={dateTo}
                    onSelect={(from, to) => { setDateFrom(from); setDateTo(to); }}
                    onClose={() => setShowCalendar(false)}
                    constrainWidth
                    anchorRef={attendanceCardRef as React.RefObject<HTMLElement>}
                  />
                )}
              </div>
            )}

            {barsError && <p className="text-base px-1" style={{ color: '#fca5a5' }}>{barsError}</p>}

            <div ref={chartCardRef} className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', position: 'relative' }}>
              <div className="flex items-center justify-end px-3 pt-2">
                <button onClick={loadBars} className="opacity-50 hover:opacity-100 transition-opacity">
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="w-full">
                <AttendanceBarChart bars={bars} loading={loadingBars} tab={attendanceTab}
                  activeBarIdx={activeBarIdx} onBarClick={handleBarClick} />
              </div>
              <div className="flex justify-end px-3 pb-3">
                <span className="flex items-center gap-1 text-base" style={{ color: 'var(--gv-text-subtle)' }}>
                  <span className="w-2 h-2 rounded-sm flex-shrink-0 inline-block" style={{ background: '#3b82f6' }} />
                  Present
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Project Status</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {PROJECT_STATUS_CONFIG.map(({ key, label, color }) => (
              <StatusCard key={key} label={label} color={color}
                value={m?.projectStatus?.[key] ?? 0} loading={loading} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Row 2: Expenditure (left) | Permits (right) ── */}
      <div className="px-4 pb-5 grid grid-cols-2 gap-3 items-start">

        {/* Expenditure */}
        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Expenditure</SectionTitle>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Supplier',      value: m?.expenditure?.supplier      ?? 0, color: '#a78bfa' },
              { label: 'Subcontractor', value: m?.expenditure?.subcontractor ?? 0, color: '#3b82f6' },
              { label: 'Total',         value: m?.expenditure?.total         ?? 0, color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between rounded-2xl px-4 py-5"
                style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', minHeight: 80 }}>
                <p className="text-lg" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
                {loading
                  ? <div className="h-4 w-16 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <p className="text-xl font-bold" style={{ color }}>{fmtKsh(value)}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Permits */}
        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Permits</SectionTitle>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Pending',  value: m?.permits?.pending  ?? 0, color: '#eab308' },
              { label: 'Approved', value: m?.permits?.approved ?? 0, color: '#22c55e' },
              { label: 'Rejected', value: m?.permits?.rejected ?? 0, color: '#f87171' },
            ].map(({ label, value, color }) => (
              <StatusCard key={label} label={label} value={value} color={color} loading={loading} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Row 3: Store & Materials (left) | Orders (right) ── */}
      <div className="px-4 pb-5 grid grid-cols-2 gap-3 items-start">

        {/* Store & Materials */}
        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Store & Materials</SectionTitle>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
            {[
              { label: 'Materials',  value: m?.materials?.totalMaterials     ?? 0 },
              { label: 'Tools',      value: m?.materials?.totalTools         ?? 0 },
              { label: 'On Hire',    value: m?.materials?.toolsOnHire        ?? 0 },
              { label: 'In Repair',  value: m?.materials?.toolsInRepair      ?? 0 },
              { label: 'Low Stocks', value: m?.materials?.sitesWithLowStocks ?? 0 },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center justify-between px-3 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                <p className="text-base" style={{ color: 'var(--gv-text-muted)' }}>{row.label}</p>
                {loading
                  ? <div className="h-3 w-5 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <p className="text-base font-semibold text-white">{row.value}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <SectionTitle>Orders</SectionTitle>
            {!loading && m && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                style={{ background: 'var(--gv-brand)', marginTop: -2 }}>
                {m?.orders?.totalOrders ?? 0}
              </span>
            )}
          </div>
          {loading ? (
            <div className="rounded-2xl p-4" style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
              <div className="h-4 w-24 rounded animate-pulse mb-2" style={{ background: 'var(--gv-glass-bg-strong)' }} />
              <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
            </div>
          ) : m?.orders?.orderBreakdown && m?.orders?.orderBreakdown.length > 0 ? (
            <div className="flex flex-col gap-2">
              {m?.orders?.orderBreakdown.map((order, i) => {
                const siteName = order.site ?? order.site_name ?? '';
                const itemName = order.item ?? order.item_name ?? order.material_name ?? order.material ?? '';
                return (
                  <div key={i} className="rounded-2xl p-3"
                    style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
                    {siteName && (
                      <p className="text-base font-semibold text-white mb-1 truncate">{siteName}</p>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-base truncate" style={{ color: 'var(--gv-text-muted)' }}>{itemName || '—'}</p>
                      {order.quantity != null && (
                        <p className="text-base font-medium text-white flex-shrink-0">
                          {order.quantity} {order.unit ?? ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl p-5 flex items-center justify-center"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
              <p className="text-base" style={{ color: 'var(--gv-text-muted)' }}>No orders yet</p>
            </div>
          )}
        </div>

      </div>

            {/* ── Week bar tooltip overlay ── */}
      {attendanceTab === 'Week' && activeBar && overlayPos && (
        <div className="fixed z-50"
          style={{ top: overlayPos.top - 8, left: overlayPos.left, transform: 'translate(-50%, -100%)', pointerEvents: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-4 shadow-2xl"
            style={{ minWidth: 200, background: 'rgba(14,16,26,0.98)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(24px)' }}>
            <button onClick={() => { setActiveBarIdx(null); setOverlayPos(null); }}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-base"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>✕</button>
            <p className="text-lg font-bold text-white leading-tight pr-6">{activeBar.fullLabel}</p>
            <p className="text-base mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{activeBar.dateDisplay}</p>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: '#3b82f6' }} />
                <span className="text-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>Present</span>
              </div>
              <span className="text-3xl font-bold text-white">{activeBar.present}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}