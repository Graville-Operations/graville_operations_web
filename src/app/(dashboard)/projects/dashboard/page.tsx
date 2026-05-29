'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { fetchOverviewKPIs, fetchSites } from '@/lib/api/sites';
import { OverviewKPIs, ProjectStatus, Site, SiteStatus } from '@/types/site';
import {
  Building2, Users, ClipboardList, FileText,
  Shield, UserCheck, AlertCircle, Loader2, RefreshCw,
  Calendar, ChevronRight,
} from 'lucide-react';

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
//  Overview KPI card
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
//  Attendance bar chart
// ─────────────────────────────────────────────

function AttendanceBarChart({ tab, dateFrom, dateTo }: {
  tab: 'Today' | 'Week' | 'Month' | 'Custom';
  dateFrom?: string; dateTo?: string;
}) {
  const bars =
    tab === 'Today'
      ? [{ date: 'Today', present: 2, late: 0 }]
      : tab === 'Week'
      ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({
          date: d, present: [3,5,4,6,2,0,1][i], late: [1,0,1,0,1,0,0][i],
        }))
      : [
          { date:'01 May', present:0,  late:0 },
          { date:'04 May', present:2,  late:0 },
          { date:'05 May', present:3,  late:1 },
          { date:'06 May', present:5,  late:0 },
          { date:'07 May', present:4,  late:1 },
          { date:'08 May', present:4,  late:0 },
          { date:'11 May', present:1,  late:0 },
          { date:'13 May', present:2,  late:0 },
          { date:'16 May', present:1,  late:0 },
          { date:'21 May', present:10, late:0 },
          { date:'22 May', present:5,  late:0 },
          { date:'23 May', present:6,  late:1 },
          { date:'24 May', present:4,  late:0 },
          { date:'26 May', present:0,  late:0 },
        ];

  const maxVal = Math.max(...bars.map((b) => b.present + b.late), 15);
  const yMax   = Math.ceil(maxVal / 5) * 5;
  const yTicks = [0, 5, 10, 15].filter((t) => t <= yMax + 2);
  const W = 320, H = 160, PL = 28, PB = 24, PT = 8, PR = 4;
  const cW = W - PL - PR, cH = H - PB - PT;
  const barW = Math.max(4, Math.floor(cW / bars.length) - 2);
  const gap  = cW / bars.length;
  const step = Math.max(1, Math.floor(bars.length / 6));
  const lbls = new Set(bars.map((_, i) => i).filter((i) => i === 0 || i === bars.length - 1 || i % step === 0));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {yTicks.map((tick) => {
        const y = PT + cH - (tick / yMax) * cH;
        return (
          <g key={tick}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={PL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">{tick}</text>
          </g>
        );
      })}
      {bars.map((b, i) => {
        const cx = PL + i * gap + gap / 2;
        const x  = cx - barW / 2;
        const pH = (b.present / yMax) * cH;
        const lH = (b.late / yMax) * cH;
        const pY = PT + cH - pH;
        const lY = pY - lH;
        return (
          <g key={i}>
            {b.present > 0 && <rect x={x} y={pY} width={barW} height={pH} rx="2" fill="#3b82f6" opacity="0.85" />}
            {b.late    > 0 && <rect x={x} y={lY} width={barW} height={lH} rx="2" fill="#ef4444" opacity="0.85" />}
            {lbls.has(i) && (
              <text x={cx} y={H - 6} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">{b.date}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Workers donut
// ─────────────────────────────────────────────

function WorkersDonut({ total, present, loading }: { total: number; present: number; loading?: boolean }) {
  const R = 54, SW = 13, CX = 70, CY = 70;
  const circ = 2 * Math.PI * R;
  const dash  = total > 0 ? (present / total) * circ : 0;
  if (loading) return <div className="flex items-center justify-center" style={{ width: 140, height: 140 }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} /></div>;
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#3b82f6" strokeWidth={SW}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
      <text x={CX} y={CY - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="white">{total}</text>
      <text x={CX} y={CY + 13} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">total</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Site status donut
// ─────────────────────────────────────────────

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
  if (loading) return <div className="flex items-center justify-center" style={{ width: 140, height: 140 }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} /></div>;
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      {rings.map((ring) => {
        const circ = 2 * Math.PI * ring.r;
        const dash = (ring.value / total) * circ;
        return (
          <g key={ring.r}>
            <circle cx={CX} cy={CY} r={ring.r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={ring.sw} />
            {ring.value > 0 && (
              <circle cx={CX} cy={CY} r={ring.r} fill="none" stroke={ring.color} strokeWidth={ring.sw}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────

export default function ProjectsDashboardPage() {
  const [sites, setSites]         = useState<Site[]>([]);
  const [kpis, setKpis]           = useState<OverviewKPIs | null>(null);
  const [loadingKpis, setLoadingKpis]   = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [kpisError, setKpisError]       = useState<string | null>(null);
  const [attendanceTab, setAttendanceTab] = useState<'Today' | 'Week' | 'Month' | 'Custom'>('Month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Derived
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
  const totalSites     = kpis?.totalSites     ?? 0;
  const activeSites    = kpis?.activeSites    ?? 0;
  const planningSites  = kpis?.planningSites  ?? 0;
  const pausedSites    = sites.filter((s) => normProjectStatus(s.project_status) === 'ON_HOLD').length;
  const doneSites      = sites.filter((s) => normProjectStatus(s.project_status) === 'COMPLETED').length;

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

      {/* ══════════════════════════════
           SECTION 1 — Overview
      ══════════════════════════════ */}
      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={Building2}   label="Total Sites"       loading={loadingKpis} value={totalSites}            sub={`${activeSites} active`} />
          <KpiCard icon={Users}       label="Workers"           loading={loadingKpis} value={totalWorkers}          sub={`${activeWorkers} active`} />
          <KpiCard icon={ClipboardList} label="Tasks"           loading={loadingKpis} value={`${completedTasks}/${totalTasks}`} sub={`${taskPct}% done`} />
          <KpiCard icon={FileText}    label="Invoiced"          loading={loadingKpis} value={invoicedFmt}           sub={pendingFmt} />
          <KpiCard icon={Shield}      label="Permits"           loading={loadingKpis} value={kpis?.totalPermits ?? 0} sub={`${kpis?.expiring_permits ?? 0} expiring`} />
          <KpiCard icon={UserCheck}   label="Attendance Today"  loading={loadingKpis} value={`${attendancePct}%`}  sub={`${presentToday} present`} />
        </div>
      </div>

      {/* ══════════════════════════════
           SECTION 2 — Attendance + Site Statuses (side by side)
      ══════════════════════════════ */}
      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Attendance</p>

        {/* Period tabs */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto">
          {(['Today', 'Week', 'Month', 'Custom'] as const).map((t) => {
            const active = attendanceTab === t;
            return (
              <button key={t} onClick={() => { setAttendanceTab(t); if (t === 'Custom') setShowDatePicker(true); }}
                className="text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
                style={active
                  ? { background: 'var(--gv-brand)', color: '#fff' }
                  : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                {t}
              </button>
            );
          })}
        </div>

        {/* Custom date picker */}
        {attendanceTab === 'Custom' && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-[11px] mb-1 block" style={{ color: 'var(--gv-text-subtle)' }}>From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="gv-input w-full text-sm" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="flex-1">
              <label className="text-[11px] mb-1 block" style={{ color: 'var(--gv-text-subtle)' }}>To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="gv-input w-full text-sm" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
        )}

        {/* Attendance chart + Site Statuses side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Attendance chart card */}
          <div className="rounded-2xl p-3 flex flex-col"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
            <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--gv-text-muted)' }}>
              {attendanceTab === 'Custom' && dateFrom && dateTo
                ? `${dateFrom} – ${dateTo}`
                : attendanceTab}
            </p>
            {loadingKpis
              ? <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} /></div>
              : <AttendanceBarChart tab={attendanceTab} dateFrom={dateFrom} dateTo={dateTo} />}
            {/* Legend */}
            <div className="flex flex-col gap-1 mt-2">
              {[
                { label: 'Present', color: '#3b82f6' },
                { label: 'Late',    color: '#ef4444' },
                { label: 'Absent',  color: 'rgba(255,255,255,0.12)' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--gv-text-subtle)' }}>
                  <span className="w-2 h-2 rounded-sm flex-shrink-0 inline-block" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Site Statuses card */}
          <div className="rounded-2xl p-3 flex flex-col items-center justify-between"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
            <p className="text-[11px] font-medium mb-2 self-start" style={{ color: 'var(--gv-text-muted)' }}>Site Statuses</p>
            <SiteStatusDonut active={activeSites} planning={planningSites}
              paused={pausedSites} done={doneSites} loading={loadingSites || loadingKpis} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 w-full">
              {[
                { label: 'Active',   color: '#22c55e' },
                { label: 'Planning', color: '#3b82f6' },
                { label: 'Paused',   color: '#eab308' },
                { label: 'Done',     color: '#14b8a6' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--gv-text-subtle)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
           SECTION 3 — Workers (donut + stats table side by side)
      ══════════════════════════════ */}
      <div className="px-4 pb-5">
        <p className="text-lg font-bold text-white mb-3">Workers</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Donut */}
          <div className="rounded-2xl p-4 flex flex-col items-center justify-center"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
            <WorkersDonut total={totalWorkers} present={presentToday} loading={loadingKpis} />
            <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--gv-brand)' }}>
              <RefreshCw className="w-3 h-3" />Present
            </div>
          </div>

          {/* Stats rows */}
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

      {/* ══════════════════════════════
           CTA — Go to Construction Sites
      ══════════════════════════════ */}
      <div className="px-4">
        <a href="/dashboard/projects/sites"
          className="flex items-center justify-between w-full rounded-2xl p-4 transition-all"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.3)' }}>
              <Building2 className="w-4 h-4" style={{ color: 'var(--gv-brand)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Construction Sites</p>
              <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{totalSites} sites · {activeSites} active</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--gv-text-muted)' }} />
        </a>
      </div>

    </div>
  );
}