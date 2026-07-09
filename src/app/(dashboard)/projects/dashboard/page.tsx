'use client';

import {
  Building2, Users, ClipboardList, ShoppingCart,
  Shield, UserCheck, Loader2, RefreshCw,
} from 'lucide-react';
import { useProjectsDashboard } from '@/hooks/projects/useProjectsDashboard';
import { fmtKsh } from '@/lib/utils/dashboard-helpers';
import { KpiCard } from '@/components/projects/KpiCard';
import { SectionTitle } from '@/components/projects/SectionTitle';
import { StatusCard } from '@/components/projects/StatusCard';
import { AttendanceSection } from '@/components/projects/AttendanceSection';

const PROJECT_STATUS_CONFIG = [
  { key: 'planning'   as const, label: 'Planning',    color: '#a78bfa' },
  { key: 'inProgress' as const, label: 'In Progress', color: '#3b82f6' },
  { key: 'onHold'     as const, label: 'On Hold',     color: '#eab308' },
  { key: 'completed'  as const, label: 'Completed',   color: '#22c55e' },
  { key: 'cancelled'  as const, label: 'Cancelled',   color: '#f87171' },
];

export default function ProjectsDashboardPage() {
  const {
    metrics, loading, load,
    attendanceTab, setAttendanceTab,
    dateFrom, setDateFrom, dateTo, setDateTo,
    bars, loadingBars, barsError, loadBars,
  } = useProjectsDashboard();

  const m = metrics;

  return (
    <div className="gv-page-dashboard flex flex-col gap-0 overflow-y-auto pb-10">

      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Projects Dashboard</h1>
        <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--gv-brand)' }} />
            : <RefreshCw className="w-4 h-4" style={{ color: 'var(--gv-text-muted)' }} />}
        </button>
      </div>

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

      <div className="px-4 pb-5 grid grid-cols-2 gap-3 items-stretch">

        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Attendance</SectionTitle>
          <AttendanceSection
            attendanceTab={attendanceTab} setAttendanceTab={setAttendanceTab}
            dateFrom={dateFrom} setDateFrom={setDateFrom}
            dateTo={dateTo} setDateTo={setDateTo}
            bars={bars} loadingBars={loadingBars} barsError={barsError} loadBars={loadBars}
          />
        </div>

        <div className="flex flex-col gap-3 min-w-0 h-full">
          <SectionTitle>Project Status</SectionTitle>
          <div className="grid grid-cols-2 grid-rows-3 gap-1.5 flex-1">
            {PROJECT_STATUS_CONFIG.map(({ key, label, color }) => (
              <StatusCard key={key} label={label} color={color}
                value={m?.projectStatus?.[key] ?? 0} loading={loading}
                minHeight={0} valueSize="text-3xl" />
            ))}
          </div>
        </div>

      </div>

      <div className="px-4 pb-5 grid grid-cols-2 gap-3 items-start">

        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Expenditure</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Supplier',      value: m?.expenditure?.supplier      ?? 0, color: '#a78bfa' },
              { label: 'Subcontractor', value: m?.expenditure?.subcontractor ?? 0, color: '#3b82f6' },
              { label: 'Total',         value: m?.expenditure?.total         ?? 0, color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', height: 72 }}>
                <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
                {loading
                  ? <div className="h-4 w-16 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <p className="text-lg font-bold" style={{ color }}>{fmtKsh(value)}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <SectionTitle>Permits</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Pending',  value: m?.permits?.pending  ?? 0, color: '#eab308' },
              { label: 'Approved', value: m?.permits?.approved ?? 0, color: '#22c55e' },
              { label: 'Rejected', value: m?.permits?.rejected ?? 0, color: '#f87171' },
            ].map(({ label, value, color }) => (
              <StatusCard key={label} label={label} value={value} color={color} loading={loading}
                height={72} valueSize="text-2xl" />
            ))}
          </div>
        </div>

      </div>

      <div className="px-4 pb-5 grid grid-cols-2 gap-3 items-start">

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
          ) : m?.orders?.orderBreakdown && m.orders.orderBreakdown.length > 0 ? (
            <div className="flex flex-col gap-2">
              {m.orders.orderBreakdown.map((order, i) => (
                <div key={i} className="rounded-2xl p-3"
                  style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
                  {order.siteName && (
                    <p className="text-base font-semibold text-white mb-2 truncate">{order.siteName}</p>
                  )}
                  <div className="flex flex-col gap-1">
                    {(order.materials ?? []).map((mat, j) => (
                      <div key={j} className="flex items-center justify-between gap-2">
                        <p className="text-base truncate" style={{ color: 'var(--gv-text-muted)' }}>
                          {mat.materialName || '—'}
                        </p>
                        <p className="text-base font-medium text-white flex-shrink-0">
                          {mat.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-4 flex items-center justify-center"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', minHeight: 80 }}>
              <p className="text-base" style={{ color: 'var(--gv-text-muted)' }}>No orders yet</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}