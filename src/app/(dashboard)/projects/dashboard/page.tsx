'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchOverviewKPIs, fetchSites } from '@/lib/api/sites';
import api from '@/lib/api';                          // ← auth-aware axios instance
import { OverviewKPIs, ProjectStatus, Site, SiteStatus } from '@/types/site';
import {
  Building2, Users, ClipboardList, FileText,
  Shield, UserCheck, AlertCircle, Loader2, RefreshCw,
  ChevronLeft, ChevronRight as ChevronRightIcon, Calendar,
} from 'lucide-react';


function normProjectStatus(s: string): ProjectStatus {

  const map: Record<string, ProjectStatus> = {
    planning:    'PLANNING',
    in_progress: 'IN_PROGRESS',
    'in progress': 'IN_PROGRESS',
    inprogress:  'IN_PROGRESS',
    on_hold:     'ON_HOLD',
    'on hold':   'ON_HOLD',
    onhold:      'ON_HOLD',
    completed:   'COMPLETED',
    cancelled:   'CANCELLED',
  };
  return map[s?.toLowerCase().replace(/-/g, '_')] ?? 'PLANNING';
}

function normSiteStatus(s: string): SiteStatus {
  const map: Record<string, SiteStatus> = { active: 'ACTIVE', inactive: 'INACTIVE', closed: 'CLOSED' };
  return map[s?.toLowerCase()] ?? 'INACTIVE';
}


function toISO(d: Date) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface AttendanceDay {
  date: string;
  present_count: number;
}

function normaliseAnalyticsResponse(raw: unknown): AttendanceDay[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;

  let arr: unknown[] = [];
  if (Array.isArray(obj.data)) {
    arr = obj.data;
  } else if (Array.isArray(raw)) {
    arr = raw as unknown[];
  }

  return arr
    .map((row: any) => ({
      date: String(row.date ?? row.attendance_date ?? ''),
      present_count: Number(
        row.attendance_count ??   
        row.present_count      ??
        row.present            ??
        row.count              ??
        row.workers_present    ??
        row.total_present      ??
        row.total              ??
        0,
      ),
    }))
    .filter(r => r.date !== '' && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}

async function fetchAttendanceAnalytics(
  dateFrom: string,
  dateTo: string,
): Promise<AttendanceDay[]> {
  try {
    const res = await api.get('/attendance/analytics', {
      params: { date_from: dateFrom, date_to: dateTo },
    });
    const raw = res.data;
    console.log('[Attendance/analytics] raw:', JSON.stringify(raw).slice(0, 400));
    const result = normaliseAnalyticsResponse(raw);
    console.log('[Attendance/analytics] parsed:', result);
    return result;
  } catch (err) {
    console.warn('[Attendance/analytics] fetch error:', err);
    return [];
  }
}

function KpiCard({ label, value, sub, icon: Icon, loading }: {
  label: string; value: React.ReactNode; sub?: string;
  icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl p-4"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
      </div>
      {loading
        ? <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-3xl font-bold text-white leading-none">{value}</p>}
      {sub && <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{sub}</p>}
    </div>
  );
}

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

  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
  const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su'];

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
        <span className="text-sm font-semibold text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ChevronRightIcon className="w-4 h-4 text-white" />
        </button>
      </div>

      <p className="text-[11px] mb-2 text-center" style={{ color: 'var(--gv-text-muted)' }}>
        {selecting === 'from' ? 'Select start date' : 'Select end date'}
      </p>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-medium py-1"
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
                  <span className="text-xs font-medium"
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
        <div className="text-[11px]" style={{ color: 'var(--gv-text-muted)' }}>
          {dateFrom && <span>From: <span className="text-white">{dateFrom}</span></span>}
          {dateTo   && <span className="ml-2">To: <span className="text-white">{dateTo}</span></span>}
        </div>
        <button onClick={onClose} className="text-[11px] px-3 py-1 rounded-lg"
          style={{ background: '#3b82f6', color: '#fff' }}>Done</button>
      </div>
    </div>
  );
}


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

  const W = 400, H = 185;
  const PL = 28, PB = 28, PT = 12, PR = 4;
  const cW = W - PL - PR;
  const cH = H - PB - PT;

  const count   = Math.max(bars.length, 1);
  const isWeek  = tab === 'Week';
  const isMonth = tab === 'Month';

  const gap  = cW / count;
  const barW = Math.max(3, Math.floor(gap) - (count > 20 ? 1 : count > 7 ? 4 : 10));

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: H }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H, display: 'block' }}
      onClick={() => { if (activeBarIdx !== null) onBarClick(null); }}>

      {yTicks.map((tick) => {
        const y = PT + cH - (tick / yMax) * cH;
        return (
          <g key={tick}>
            <line x1={PL} x2={W - PR} y1={y} y2={y}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x={PL - 4} y={y} textAnchor="end" dominantBaseline="central"
              fontSize="13" fontWeight="500" fill="rgba(255,255,255,0.55)" fontFamily="inherit">
              {tick}
            </text>
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
            {open && (
              <rect x={x - 4} y={PT} width={barW + 8} height={cH}
                fill="rgba(255,255,255,0.06)" rx="3" />
            )}
            {b.present > 0 && (
              <rect x={x} y={pY} width={barW} height={pH} rx="2"
                fill="#3b82f6" opacity={open ? 1 : 0.85} />
            )}
            <text x={cx} y={H - 6} textAnchor="middle"
              fontSize={isMonth ? 10 : 13}
              fontWeight={open ? '700' : '400'}
              fill={open ? '#fff' : 'rgba(255,255,255,0.55)'}
              fontFamily="inherit">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WorkersDonut({ total, present, loading }: { total: number; present: number; loading?: boolean }) {
  const R = 54, SW = 13, CX = 70, CY = 70;
  const circ = 2 * Math.PI * R;
  const dash  = total > 0 ? (present / total) * circ : 0;

  if (loading) return (
    <div className="flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
    </div>
  );
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#3b82f6" strokeWidth={SW}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`} />
      <text x={CX} y={CY - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="white">{total}</text>
      <text x={CX} y={CY + 13} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">total</text>
    </svg>
  );
}


interface ProjectStatusCounts {
  planning:    number;
  inProgress:  number;
  onHold:      number;
  completed:   number;
  cancelled:   number;
}

const PROJECT_STATUS_RINGS: Array<{
  key: keyof ProjectStatusCounts;
  label: string;
  color: string;
  r: number;
  sw: number;
}> = [
  { key: 'inProgress', label: 'In Progress', color: '#3b82f6', r: 54, sw: 11 },
  { key: 'planning',   label: 'Planning',    color: '#a78bfa', r: 42, sw: 10 },
  { key: 'completed',  label: 'Completed',   color: '#22c55e', r: 30, sw: 10 },
  { key: 'onHold',     label: 'On Hold',     color: '#eab308', r: 19, sw: 9  },
  { key: 'cancelled',  label: 'Cancelled',   color: '#f87171', r: 9,  sw: 7  },
];

function countProjectStatuses(sites: Site[]): ProjectStatusCounts {
  const counts: ProjectStatusCounts = { planning: 0, inProgress: 0, onHold: 0, completed: 0, cancelled: 0 };
  for (const site of sites) {
   
    const raw  = (site as any).projectStatus ?? site.project_status ?? '';
    const norm = normProjectStatus(String(raw));
    if      (norm === 'PLANNING')    counts.planning++;
    else if (norm === 'IN_PROGRESS') counts.inProgress++;
    else if (norm === 'ON_HOLD')     counts.onHold++;
    else if (norm === 'COMPLETED')   counts.completed++;
    else if (norm === 'CANCELLED')   counts.cancelled++;
  }
  return counts;
}

function ProjectStatusDonut({ counts, loading }: {
  counts: ProjectStatusCounts;
  loading?: boolean;
}) {
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  const CX = 70, CY = 70;

  if (loading) return (
    <div className="flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
    </div>
  );
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      {PROJECT_STATUS_RINGS.map((ring) => {
        const value = counts[ring.key];
        const circ  = 2 * Math.PI * ring.r;
        const dash  = (value / total) * circ;
        return (
          <g key={ring.key}>
            <circle cx={CX} cy={CY} r={ring.r} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth={ring.sw} />
            {value > 0 && (
              <circle cx={CX} cy={CY} r={ring.r} fill="none" stroke={ring.color}
                strokeWidth={ring.sw} strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
            )}
          </g>
        );
      })}

    </svg>
  );
}

export default function ProjectsDashboardPage() {
  const [sites, setSites]               = useState<Site[]>([]);
  const [kpis, setKpis]                 = useState<OverviewKPIs | null>(null);
  const [loadingKpis, setLoadingKpis]   = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [kpisError, setKpisError]       = useState<string | null>(null);

  const [attendanceTab, setAttendanceTab]   = useState<'Today' | 'Week' | 'Month' | 'Custom'>('Month');
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [showCalendar, setShowCalendar]     = useState(false);

  const attendanceCardRef = useRef<HTMLDivElement>(null);
  const calendarRef       = useRef<HTMLDivElement>(null);
  const chartCardRef      = useRef<HTMLDivElement>(null);

  const [bars, setBars]                   = useState<Bar[]>([]);
  const [loadingBars, setLoadingBars]     = useState(false);
  const [barsError, setBarsError]         = useState<string | null>(null);

  const [activeBarIdx, setActiveBarIdx]   = useState<number | null>(null);
  const [overlayPos, setOverlayPos]       = useState<{ top: number; left: number } | null>(null);

  const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DAY_FULL    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'
  const load = useCallback(() => {
    setLoadingKpis(true); setKpisError(null);
    fetchOverviewKPIs()
      .then((res) => { const d = (res as any).data ?? res; setKpis(d as OverviewKPIs); })
      .catch(() => setKpisError('Failed to load analytics.'))
      .finally(() => setLoadingKpis(false));

    setLoadingSites(true);
    fetchSites()
      .then((data) => {
        
        const items: Site[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data?.items)
          ? (data as any).data.items
          : Array.isArray((data as any)?.items)
          ? (data as any).items
          : [];
        setSites(items);
      })
      .catch(() => setSites([]))
      .finally(() => setLoadingSites(false));
  }, []);

  useEffect(() => { load(); }, [load]);


  function buildDateRange(tab: typeof attendanceTab): { from: string; to: string } | null {
    const now = new Date();
    if (tab === 'Today') {
      const iso = toISO(now);
      return { from: iso, to: iso };
    }
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
     
      const today = toISO(new Date());
      const safeTo = dateTo > today ? today : dateTo;
      return { from: dateFrom, to: safeTo };
    }
    return null;
  }

  function buildBars(
    summary: AttendanceDay[],
    fromISO: string,
    toISO_: string,
    tab: typeof attendanceTab,
  ): Bar[] {
    const lookup: Record<string, number> = {};
    for (const row of summary) {
      lookup[row.date] = row.present_count;
    }

    const result: Bar[] = [];

    function parseLocalDate(iso: string): Date {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d); // local midnight, no timezone shift
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
          : tab === 'Custom'
          ? DAY_NAMES[dow]                            
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
      console.log('[Dashboard] attendance summary rows:', summary.length);
      setBars(buildBars(summary, range.from, range.to, attendanceTab));
    } catch (err) {
      console.error('[Dashboard] loadBars error:', err);
      setBarsError('Could not load attendance data.');
      setBars(buildBars([], range.from, range.to, attendanceTab));
    } finally {
      setLoadingBars(false);
    }
  }, [attendanceTab, dateFrom, dateTo]);

  useEffect(() => { setActiveBarIdx(null); loadBars(); }, [loadBars]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
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

  const totalTasks     = kpis?.totalTasks     ?? 0;
  const completedTasks = kpis?.completedTasks ?? 0;
  const taskPct        = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalWorkers   = kpis?.totalWorkers   ?? 0;
  const activeWorkers  = kpis?.active_workers ?? 0;
  const presentToday   = kpis?.presentToday   ?? 0;
  const attendancePct  = totalWorkers > 0 ? Math.round((presentToday / totalWorkers) * 100) : 0;
  const totalInvoiced  = kpis?.totalInvoiced  ?? 0;
  const invoicedFmt    = `KSH ${totalInvoiced.toLocaleString()}`;
  const pendingFmt     = `KSH ${(kpis?.pendingInvoiceValue ?? 0).toLocaleString()} pending`;
  const totalSites          = kpis?.totalSites ?? sites.length;
 
  const projectStatusCounts = countProjectStatuses(sites);

  const customLabel = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : 'Pick dates';
  const activeBar   = activeBarIdx !== null ? bars[activeBarIdx] : null;
  const now         = new Date();

  return (
    <div className="gv-page-dashboard flex flex-col gap-0 overflow-y-auto pb-10">

      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projects Dashboard</h1>
        <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
          {loadingKpis
            ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--gv-brand)' }} />
            : <RefreshCw className="w-4 h-4" style={{ color: 'var(--gv-text-muted)' }} />}
        </button>
      </div>

      {kpisError && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#fde68a' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{kpisError}
          <button onClick={load} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={Building2}     label="Total Sites"      loading={loadingKpis} value={totalSites}              sub={`${projectStatusCounts.inProgress} in progress`} />
          <KpiCard icon={Users}         label="Workers"          loading={loadingKpis} value={totalWorkers}            sub={`${activeWorkers} active`} />
          <KpiCard icon={ClipboardList} label="Tasks"            loading={loadingKpis} value={`${completedTasks}/${totalTasks}`} sub={`${taskPct}% done`} />
          <KpiCard icon={FileText}      label="Invoiced"         loading={loadingKpis} value={invoicedFmt}             sub={pendingFmt} />
          <KpiCard icon={Shield}        label="Permits"          loading={loadingKpis} value={kpis?.totalPermits ?? 0} sub={`${kpis?.expiring_permits ?? 0} expiring`} />
          <KpiCard icon={UserCheck}     label="Attendance Today" loading={loadingKpis} value={`${attendancePct}%`}    sub={`${presentToday} present`} />
        </div>
      </div>
      <div className="px-4 pb-5">
        <div className="grid grid-cols-2 gap-3 items-stretch">

          <div ref={attendanceCardRef} className="flex flex-col gap-3">
            <p className="text-lg font-bold text-white">Attendance</p>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(['Today', 'Week', 'Month', 'Custom'] as const).map((t) => {
                const active = attendanceTab === t;
                return (
                  <button key={t}
                    onClick={() => {
                      setAttendanceTab(t);
                      if (t === 'Custom') setShowCalendar(true);
                    }}
                    className="text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
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
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: 'var(--gv-glass-bg)',
                    border: '1px solid var(--gv-glass-border)',
                    color: dateFrom ? '#fff' : 'var(--gv-text-muted)',
                  }}>
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />
                  {dateFrom && dateTo
                    ? `${dateFrom}  →  ${dateTo}`
                    : dateFrom
                    ? `From ${dateFrom} — pick end date`
                    : 'Select date range'}
                  <ChevronRightIcon className="w-4 h-4 ml-auto opacity-40" />
                </button>

                {showCalendar && (
                  <CalendarPicker
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onSelect={(from, to) => { setDateFrom(from); setDateTo(to); }}
                    onClose={() => setShowCalendar(false)}
                    constrainWidth
                    anchorRef={attendanceCardRef as React.RefObject<HTMLElement>}
                  />
                )}
              </div>
            )}

            {barsError && (
              <p className="text-xs px-1" style={{ color: '#fca5a5' }}>{barsError}</p>
            )}

            <div
              ref={chartCardRef}
              className="rounded-2xl overflow-visible flex flex-col"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', position: 'relative' }}
            >
              <div className="flex items-center justify-between px-3 pt-3 mb-1">
                <p className="text-xs font-semibold" style={{ color: 'var(--gv-text-muted)' }}>
                  {attendanceTab === 'Month'
                    ? `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
                    : attendanceTab === 'Custom' && dateFrom && dateTo
                    ? `${dateFrom} – ${dateTo}`
                    : attendanceTab}
                </p>
                <button onClick={loadBars} className="opacity-50 hover:opacity-100 transition-opacity">
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              </div>

              <div className="w-full" style={{ overflow: 'visible' }}>
                <AttendanceBarChart
                  bars={bars}
                  loading={loadingBars}
                  tab={attendanceTab}
                  activeBarIdx={activeBarIdx}
                  onBarClick={handleBarClick}
                />
              </div>

              <div className="flex justify-end px-3 pb-3">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 inline-block" style={{ background: '#3b82f6' }} />
                  Present
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 h-full">
            <p className="text-lg font-bold text-white">Project Statuses</p>
            <div className="rounded-2xl p-3 flex flex-col items-center justify-between flex-1"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
              <ProjectStatusDonut
                counts={projectStatusCounts}
                loading={loadingSites}
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 w-full">
                {PROJECT_STATUS_RINGS.map((ring) => (
                  <span key={ring.key} className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--gv-text-subtle)' }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block"
                      style={{ background: ring.color }} />
                    {ring.label}
                    <span className="ml-auto font-semibold text-white">{projectStatusCounts[ring.key]}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      {attendanceTab === 'Week' && activeBar && overlayPos && (
        <div className="fixed z-50"
          style={{
            top: overlayPos.top - 8,
            left: overlayPos.left,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-4 shadow-2xl"
            style={{
              minWidth: 200,
              background: 'rgba(14,16,26,0.98)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(24px)',
            }}>
            <button
              onClick={() => { setActiveBarIdx(null); setOverlayPos(null); }}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              ✕
            </button>
            <p className="text-sm font-bold text-white leading-tight pr-6">{activeBar.fullLabel}</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {activeBar.dateDisplay}
            </p>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
                  style={{ background: '#3b82f6' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Present</span>
              </div>
              <span className="text-xl font-bold text-white">{activeBar.present}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-5">
        <div className="grid grid-cols-2 gap-3 items-stretch">

          {/* Workers Piechart */}
          <div className="flex flex-col gap-2 h-full">
            <p className="text-lg font-bold text-white">Workers Piechart</p>
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center flex-1"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
              <WorkersDonut total={totalWorkers} present={presentToday} loading={loadingKpis} />
              <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--gv-brand)' }}>
                <RefreshCw className="w-3 h-3" />Present
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-white">Workers Analytics</p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
              {[
                { label: 'Total',    value: totalWorkers },
                { label: 'Active',   value: activeWorkers },
                { label: 'Inactive', value: Math.max(0, totalWorkers - activeWorkers) },
                { label: 'Present',  value: presentToday },
                { label: 'Late',     value: 0 },
                { label: 'Absent',   value: Math.max(0, totalWorkers - presentToday) },
                { label: 'Skills',   value: '—' },
                { label: 'In Tasks', value: '—' },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex items-center justify-between px-3 py-2"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                  <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>{row.label}</p>
                  {loadingKpis
                    ? <div className="h-3 w-5 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                    : <p className="text-xs font-semibold text-white">{row.value}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}