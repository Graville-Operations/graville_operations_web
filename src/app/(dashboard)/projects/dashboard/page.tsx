'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchOverviewKPIs, fetchSites } from '@/lib/api/sites';
import { OverviewKPIs, ProjectStatus, Site, SiteStatus } from '@/types/site';
import {
  Building2, Users, ClipboardList, FileText,
  Shield, UserCheck, AlertCircle, Loader2, RefreshCw,
  ChevronLeft, ChevronRight as ChevronRightIcon, Calendar,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normProjectStatus(s: string): ProjectStatus {
  const map: Record<string, ProjectStatus> = {
    planning: 'PLANNING', 'in progress': 'IN_PROGRESS', in_progress: 'IN_PROGRESS',
    'on hold': 'ON_HOLD', on_hold: 'ON_HOLD', completed: 'COMPLETED', cancelled: 'CANCELLED',
  };
  return map[s?.toLowerCase()] ?? 'PLANNING';
}

function normSiteStatus(s: string): SiteStatus {
  const map: Record<string, SiteStatus> = { active: 'ACTIVE', inactive: 'INACTIVE', closed: 'CLOSED' };
  return map[s?.toLowerCase()] ?? 'INACTIVE';
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Attendance API ─────────────────────────────────────────────────────────
// GET /api/v1/attendance/summary/{site_id}?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
interface AttendanceDay { date: string; present_count: number; }

// Normalise whatever shape the API returns into AttendanceDay[]
// Handles: plain array, { summary }, { data }, { results }, { attendance }
// Handles field name variants: present_count | present | count | workers_present | total_present | total
function normaliseAttendanceResponse(raw: unknown): AttendanceDay[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const candidate = obj.summary ?? obj.data ?? obj.results ?? obj.attendance ?? null;
    if (Array.isArray(candidate)) arr = candidate;
  }
  return arr
    .map((row: any) => ({
      date: String(row.date ?? row.attendance_date ?? row.day ?? ''),
      present_count: Number(
        row.present_count ??
        row.present ??
        row.count ??
        row.workers_present ??
        row.total_present ??
        row.total ??
        0,
      ),
    }))
    .filter(r => r.date !== '');
}

async function fetchAttendanceSummaryForSite(
  siteId: string | number,
  dateFrom: string,
  dateTo: string,
): Promise<AttendanceDay[]> {
  const url = `/api/v1/attendance/summary/${siteId}?date_from=${dateFrom}&date_to=${dateTo}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Attendance] site ${siteId} → HTTP ${res.status}`);
      return [];
    }
    const raw = await res.json();
    console.log(`[Attendance] site ${siteId} raw:`, JSON.stringify(raw).slice(0, 300));
    return normaliseAttendanceResponse(raw);
  } catch (err) {
    console.warn(`[Attendance] site ${siteId} fetch error:`, err);
    return [];
  }
}

// Fetch from every site and aggregate present_count per date
async function fetchAttendanceAllSites(
  siteIds: (string | number)[],
  dateFrom: string,
  dateTo: string,
): Promise<AttendanceDay[]> {
  if (siteIds.length === 0) return [];
  const results = await Promise.allSettled(
    siteIds.map(id => fetchAttendanceSummaryForSite(id, dateFrom, dateTo)),
  );
  const totals: Record<string, number> = {};
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const row of r.value) {
      totals[row.date] = (totals[row.date] ?? 0) + row.present_count;
    }
  }
  return Object.entries(totals).map(([date, present_count]) => ({ date, present_count }));
}


// ─── KPI Card ────────────────────────────────────────────────────────────────
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

// ─── Calendar Picker ──────────────────────────────────────────────────────────
function CalendarPicker({
  dateFrom, dateTo, onSelect, onClose,
}: {
  dateFrom: string; dateTo: string;
  onSelect: (from: string, to: string) => void;
  onClose: () => void;
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

  function getDaysInMonth(year: number, month: number) {
    const firstDay  = new Date(year, month, 1);
    const startDow  = (firstDay.getDay() + 6) % 7;
    const daysInMo  = new Date(year, month + 1, 0).getDate();
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
    <div className="absolute z-50 rounded-2xl shadow-2xl p-4 select-none"
      style={{
        background: 'rgba(18,20,30,0.98)', border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)', top: '100%', left: 0, marginTop: 8, minWidth: 280,
      }}>
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
            const selected     = isSelected(date);
            const inR          = inRange(date);
            const iso          = toISO(date);
            const isFrom       = iso === dateFrom;
            const isTo         = iso === dateTo;
            const isTodayDate  = iso === toISO(today);
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

// ─── Bar type ─────────────────────────────────────────────────────────────────
interface Bar {
  label: string;       // short x-axis label  e.g. "Mon", "1"
  fullLabel: string;   // full day name        e.g. "Monday"
  date: string;        // ISO date             e.g. "2025-06-02"
  dateDisplay: string; // human date           e.g. "02 Jun 2025"
  present: number;
}

// ─── Attendance Bar Chart ─────────────────────────────────────────────────────
function AttendanceBarChart({
  bars, loading, tab, activeBarIdx, onBarClick,
}: {
  bars: Bar[];
  loading: boolean;
  tab: 'Today' | 'Week' | 'Month' | 'Custom';
  activeBarIdx: number | null;
  onBarClick: (idx: number | null) => void;
}) {
  // ── Y-axis ──────────────────────────────────────────────────────────────────
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

  // ── SVG dimensions ──────────────────────────────────────────────────────────
  // PL: left padding reserved for y-axis number labels
  const W = 400, H = 185;
  const PL = 28, PB = 28, PT = 12, PR = 4;
  const cW = W - PL - PR;   // chart area width (bars live here)
  const cH = H - PB - PT;

  const count   = Math.max(bars.length, 1);
  const isWeek  = tab === 'Week';
  const isMonth = tab === 'Month';

  const gap  = cW / count;
  // Thinner bars for month (31 bars) than week (7 bars)
  const barW = Math.max(3, Math.floor(gap) - (count > 20 ? 1 : count > 7 ? 4 : 10));

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: H }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H, display: 'block' }}
      onClick={() => { if (activeBarIdx !== null) onBarClick(null); }}
    >
      {/* ── Y-axis labels (LEFT) + gridlines ── */}
      {yTicks.map((tick) => {
        const y = PT + cH - (tick / yMax) * cH;
        return (
          <g key={tick}>
            {/* gridline across full chart area */}
            <line
              x1={PL} x2={W - PR} y1={y} y2={y}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1"
            />
            {/* y-axis number left of chart area */}
            <text
              x={PL - 4} y={y}
              textAnchor="end" dominantBaseline="central"
              fontSize="13" fontWeight="500"
              fill="rgba(255,255,255,0.55)"
              fontFamily="inherit"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* ── Bars ── */}
      {bars.map((b, i) => {
        // bars are positioned inside the chart area (starts at PL)
        const cx   = PL + i * gap + gap / 2;
        const x    = cx - barW / 2;
        const pH   = b.present > 0 ? (b.present / yMax) * cH : 0;
        const pY   = PT + cH - pH;
        const open = isWeek && activeBarIdx === i;

        return (
          <g key={i}
            style={{ cursor: isWeek ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (!isWeek) return;
              e.stopPropagation();
              onBarClick(open ? null : i);
            }}
          >
            {/* Full-column transparent hit area */}
            <rect x={x - 4} y={PT} width={barW + 8} height={cH} fill="transparent" />

            {/* Active column highlight */}
            {open && (
              <rect x={x - 4} y={PT} width={barW + 8} height={cH}
                fill="rgba(255,255,255,0.06)" rx="3" />
            )}

            {/* Present bar — always render so 0 shows baseline */}
            {b.present > 0 && (
              <rect
                x={x} y={pY} width={barW} height={pH} rx="2"
                fill="#3b82f6" opacity={open ? 1 : 0.85}
              />
            )}

            {/* X-axis label — every date for month, every day for week/today */}
            <text
              x={cx} y={H - 6}
              textAnchor="middle"
              fontSize={isMonth ? 10 : 13}
              fontWeight={open ? '700' : '400'}
              fill={open ? '#fff' : 'rgba(255,255,255,0.55)'}
              fontFamily="inherit"
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Workers Donut ────────────────────────────────────────────────────────────
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

// ─── Site Status Donut ────────────────────────────────────────────────────────
function SiteStatusDonut({ active, planning, paused, done, loading }: {
  active: number; planning: number; paused: number; done: number; loading?: boolean;
}) {
  const total = active + planning + paused + done || 1;
  const rings = [
    { value: active,   color: '#22c55e', r: 54, sw: 11 },
    { value: planning, color: '#3b82f6', r: 40, sw: 11 },
    { value: paused,   color: '#eab308', r: 26, sw: 11 },
    { value: done,     color: '#14b8a6', r: 13, sw: 8  },
  ];
  const CX = 70, CY = 70;
  if (loading) return (
    <div className="flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
    </div>
  );
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      {rings.map((ring) => {
        const circ = 2 * Math.PI * ring.r;
        const dash = (ring.value / total) * circ;
        return (
          <g key={ring.r}>
            <circle cx={CX} cy={CY} r={ring.r} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth={ring.sw} />
            {ring.value > 0 && (
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsDashboardPage() {
  const [sites, setSites]               = useState<Site[]>([]);
  const [kpis, setKpis]                 = useState<OverviewKPIs | null>(null);
  const [loadingKpis, setLoadingKpis]   = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [kpisError, setKpisError]       = useState<string | null>(null);

  // ── Attendance state ────────────────────────────────────────────────────────
  const [attendanceTab, setAttendanceTab]     = useState<'Today' | 'Week' | 'Month' | 'Custom'>('Month');
  const [dateFrom, setDateFrom]               = useState('');
  const [dateTo, setDateTo]                   = useState('');
  const [showCalendar, setShowCalendar]       = useState(false);
  const calendarRef                           = useRef<HTMLDivElement>(null);
  const chartCardRef                          = useRef<HTMLDivElement>(null);

  // Bars: fetched from backend
  const [bars, setBars]                       = useState<Bar[]>([]);
  const [loadingBars, setLoadingBars]         = useState(false);
  const [barsError, setBarsError]             = useState<string | null>(null);

  // Week overlay
  const [activeBarIdx, setActiveBarIdx]       = useState<number | null>(null);
  const [overlayPos, setOverlayPos]           = useState<{ top: number; left: number } | null>(null);

  // ── KPI + Sites load ────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoadingKpis(true); setKpisError(null);
    fetchOverviewKPIs()
      .then((res) => { const d = (res as any).data ?? res; setKpis(d as OverviewKPIs); })
      .catch(() => setKpisError('Failed to load analytics.'))
      .finally(() => setLoadingKpis(false));

    setLoadingSites(true);
    fetchSites()
      .then(setSites)
      .catch(() => setSites([]))
      .finally(() => setLoadingSites(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Attendance fetch ─────────────────────────────────────────────────────────
  const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DAY_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];

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
      return { from: dateFrom, to: dateTo };
    }
    return null;
  }

  // Convert API response into Bar[] — filling every date in range with 0 if missing
  function buildBars(
    summary: AttendanceDay[],
    fromISO: string,
    toISO_: string,
    tab: typeof attendanceTab,
  ): Bar[] {
    const lookup: Record<string, number> = {};
    for (const row of summary) lookup[row.date] = row.present_count;

    const result: Bar[] = [];
    const cur = new Date(fromISO);
    const end = new Date(toISO_);

    while (cur <= end) {
      const iso  = toISO(cur);
      const dow  = cur.getDay();
      const label =
        tab === 'Today'  ? 'Today' :
        tab === 'Week'   ? DAY_NAMES[dow] :
        /* Month/Custom */ String(cur.getDate());

      result.push({
        label,
        fullLabel:   tab === 'Today' ? 'Today' : DAY_FULL[dow],
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

    // Collect all site IDs from the loaded sites list.
    // Falls back to site ID 1 if sites haven't loaded yet so we still attempt a fetch.
    const siteIds = sites.length > 0
      ? sites.map(s => (s as any).id ?? (s as any).site_id).filter(Boolean)
      : [1];

    console.log('[Attendance] fetching for sites:', siteIds, 'range:', range);

    setLoadingBars(true); setBarsError(null);
    try {
      const summary = await fetchAttendanceAllSites(siteIds, range.from, range.to);
      console.log('[Attendance] aggregated summary:', summary);
      setBars(buildBars(summary, range.from, range.to, attendanceTab));
    } catch (err) {
      console.error('[Attendance] loadBars error:', err);
      setBarsError('Could not load attendance data.');
      setBars(buildBars([], range.from, range.to, attendanceTab));
    } finally {
      setLoadingBars(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceTab, dateFrom, dateTo, sites]);

  useEffect(() => {
    setActiveBarIdx(null);
    loadBars();
  }, [loadBars]);

  // ── Close calendar on outside click ─────────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCalendar]);

  // ── Close week overlay on outside click ─────────────────────────────────────
  useEffect(() => {
    function handleClick() { setActiveBarIdx(null); setOverlayPos(null); }
    if (activeBarIdx !== null) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeBarIdx]);

  // ── Week bar click: compute pixel position for overlay ──────────────────────
  function handleBarClick(idx: number | null) {
    if (idx === null) { setActiveBarIdx(null); setOverlayPos(null); return; }

    setActiveBarIdx(idx);

    // Position the overlay above the chart card
    if (chartCardRef.current) {
      const rect     = chartCardRef.current.getBoundingClientRect();
      const count    = bars.length || 1;
      // fraction of card width where bar centre sits
      const fraction = (idx + 0.5) / count;
      const left     = rect.left + fraction * rect.width;
      const top      = rect.top;      // overlay will sit above this
      setOverlayPos({ top, left });
    }
  }

  // ── Derived KPI values ───────────────────────────────────────────────────────
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
  const totalSites     = kpis?.totalSites    ?? 0;
  const activeSites    = kpis?.activeSites   ?? 0;
  const planningSites  = kpis?.planningSites ?? 0;
  const pausedSites    = sites.filter(s => normProjectStatus(s.project_status) === 'ON_HOLD').length;
  const doneSites      = sites.filter(s => normProjectStatus(s.project_status) === 'COMPLETED').length;

  const customLabel    = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : 'Pick dates';
  const activeBar      = activeBarIdx !== null ? bars[activeBarIdx] : null;
  const now            = new Date();

  return (
    <div className="gv-page-dashboard flex flex-col gap-0 overflow-y-auto pb-10">

      {/* ── Header ── */}
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

      {/* ── Overview KPIs ── */}
      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={Building2}     label="Total Sites"      loading={loadingKpis} value={totalSites}              sub={`${activeSites} active`} />
          <KpiCard icon={Users}         label="Workers"          loading={loadingKpis} value={totalWorkers}            sub={`${activeWorkers} active`} />
          <KpiCard icon={ClipboardList} label="Tasks"            loading={loadingKpis} value={`${completedTasks}/${totalTasks}`} sub={`${taskPct}% done`} />
          <KpiCard icon={FileText}      label="Invoiced"         loading={loadingKpis} value={invoicedFmt}             sub={pendingFmt} />
          <KpiCard icon={Shield}        label="Permits"          loading={loadingKpis} value={kpis?.totalPermits ?? 0} sub={`${kpis?.expiring_permits ?? 0} expiring`} />
          <KpiCard icon={UserCheck}     label="Attendance Today" loading={loadingKpis} value={`${attendancePct}%`}    sub={`${presentToday} present`} />
        </div>
      </div>

      {/* ── Attendance ── */}
      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Attendance</p>

        {/* Period tabs */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto">
          {(['Today', 'Week', 'Month', 'Custom'] as const).map((t) => {
            const active = attendanceTab === t;
            return (
              <button key={t}
                onClick={() => { setAttendanceTab(t); if (t === 'Custom') setShowCalendar(true); }}
                className="text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
                style={active
                  ? { background: 'var(--gv-brand)', color: '#fff' }
                  : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                {t === 'Custom' && (dateFrom || dateTo) ? customLabel : t}
              </button>
            );
          })}
        </div>

        {/* Custom — calendar trigger */}
        {attendanceTab === 'Custom' && (
          <div className="relative mb-3" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
              style={{
                background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)',
                color: dateFrom ? '#fff' : 'var(--gv-text-muted)',
              }}>
              <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />
              {dateFrom && dateTo ? `${dateFrom}  →  ${dateTo}` : dateFrom ? `From ${dateFrom} — pick end date` : 'Select date range'}
              <ChevronRightIcon className="w-4 h-4 ml-auto opacity-40" />
            </button>
            {showCalendar && (
              <CalendarPicker
                dateFrom={dateFrom} dateTo={dateTo}
                onSelect={(from, to) => { setDateFrom(from); setDateTo(to); }}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>
        )}

        {barsError && (
          <p className="text-xs mb-2 px-1" style={{ color: '#fca5a5' }}>{barsError}</p>
        )}

        {/* Charts grid */}
        <div className="grid grid-cols-2 gap-3">

          {/* ── Attendance chart card ── */}
          <div
            ref={chartCardRef}
            className="rounded-2xl overflow-visible flex flex-col"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', position: 'relative' }}
          >
            {/* Period label + refresh */}
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

            {/* Chart — no horizontal padding, full bleed */}
            <div className="w-full" style={{ overflow: 'visible' }}>
              <AttendanceBarChart
                bars={bars}
                loading={loadingBars}
                tab={attendanceTab}
                activeBarIdx={activeBarIdx}
                onBarClick={handleBarClick}
              />
            </div>

            {/* Legend — only Present, shown on RIGHT */}
            <div className="flex justify-end px-3 pb-3">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 inline-block" style={{ background: '#3b82f6' }} />
                Present
              </span>
            </div>
          </div>

          {/* ── Site Statuses ── */}
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-white">Site Statuses</p>
            <div className="rounded-2xl p-3 flex flex-col items-center justify-between flex-1"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
              <SiteStatusDonut
                active={activeSites} planning={planningSites}
                paused={pausedSites} done={doneSites}
                loading={loadingSites || loadingKpis} />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 w-full">
                {[
                  { label: 'Active',   color: '#22c55e' },
                  { label: 'Planning', color: '#3b82f6' },
                  { label: 'Paused',   color: '#eab308' },
                  { label: 'Done',     color: '#14b8a6' },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--gv-text-subtle)' }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block"
                      style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Week bar overlay — fixed-position, never clipped ── */}
      {attendanceTab === 'Week' && activeBar && overlayPos && (
        <div
          className="fixed z-50"
          style={{
            top:  overlayPos.top - 8,
            left: overlayPos.left,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl p-4 shadow-2xl"
            style={{
              minWidth: 200,
              background: 'rgba(14,16,26,0.98)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(24px)',
            }}>
            {/* Close */}
            <button
              onClick={() => { setActiveBarIdx(null); setOverlayPos(null); }}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              ✕
            </button>

            {/* Day + date */}
            <p className="text-sm font-bold text-white leading-tight pr-6">{activeBar.fullLabel}</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {activeBar.dateDisplay}
            </p>

            {/* Present count */}
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

      {/* ── Workers ── */}
      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Workers</p>
        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl p-4 flex flex-col items-center justify-center"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
            <WorkersDonut total={totalWorkers} present={presentToday} loading={loadingKpis} />
            <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--gv-brand)' }}>
              <RefreshCw className="w-3 h-3" />Present
            </div>
          </div>

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
  );
}