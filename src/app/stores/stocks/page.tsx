'use client';
import { useState, useMemo } from 'react';
import {
  ChevronDown, ClipboardList, AlertTriangle,
  RefreshCw, ShoppingCart, Calendar, Package,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { Site, DailyUsageRecord, StoreMaterial, ActivityTab } from '@/types/store';


function extractList<T>(raw: T[] | { items?: T[] } | null | undefined): T[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : (raw.items ?? []);
}

function safeDateSlice(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, opts);
}


function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[color:var(--border)] last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="relative overflow-hidden h-4 bg-[color:var(--muted)] rounded w-[80%]">
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                         bg-gradient-to-r from-transparent via-white/5 to-transparent"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          </div>
        </td>
      ))}
    </tr>
  );
}

function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}


function SiteSelector({
  sites, selectedSiteId, onChange, isLoading,
}: {
  sites: Site[];
  selectedSiteId: number | null;
  onChange: (id: number) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-64">
      <p className="gv-label">Viewing site</p>
      {isLoading ? (
        <div className="h-10 rounded-lg bg-[color:var(--gv-glass-bg)] relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                          bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ) : (
        <div className="relative">
          <select
            className="w-full appearance-none pr-9 pl-3 h-10 rounded-lg border border-[color:var(--border)]
                       bg-[color:var(--gv-glass-bg)] text-[color:var(--foreground)] text-sm cursor-pointer
                       outline-none transition-colors focus:border-[color:var(--gv-glass-border-hover)]
                       hover:border-[color:var(--gv-glass-border)] [&>option]:bg-[#0d1528] [&>option]:text-white"
            value={selectedSiteId ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {sites.length === 0 && <option value="">No sites available</option>}
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-[color:var(--gv-text-subtle)] pointer-events-none" />
        </div>
      )}
    </div>
  );
}

function DateFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="gv-label">Filter by date</p>
      <div className="relative">
        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2
                                       text-[color:var(--muted-foreground)] pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-3 h-10 rounded-lg border border-[color:var(--border)]
                     bg-[color:var(--gv-glass-bg)] text-[color:var(--foreground)] text-sm
                     outline-none transition-colors focus:border-[color:var(--gv-glass-border-hover)]
                     hover:border-[color:var(--gv-glass-border)] cursor-pointer"
        />
      </div>
    </div>
  );
}


export default function StoreActivityPage() {
  const [tab,            setTab]            = useState<ActivityTab>('usage');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [dateFilter,     setDateFilter]     = useState('');

  const { data: sitesRaw, loading: isSitesLoading } =
    useApi<Site[] | { items: Site[] }>('/sites/list');

  const sites: Site[]  = useMemo(() => extractList(sitesRaw), [sitesRaw]);
  const resolvedSiteId = selectedSiteId ?? sites[0]?.id ?? null;

  const {
    data: usageRaw, loading: isUsageLoading, error: usageError, refetch: refetchUsage,
  } = useApi<DailyUsageRecord[] | { items: DailyUsageRecord[] }>(
    '/daily-usage/all',
    { enabled: resolvedSiteId !== null, params: { site_id: resolvedSiteId } },
  );

  const {
    data: matsRaw, loading: isMatsLoading,
  } = useApi<StoreMaterial[] | { items?: StoreMaterial[] }>(
    `/store/materials/${resolvedSiteId}/all`,
    { enabled: resolvedSiteId !== null },
  );

  const usageLogs: DailyUsageRecord[] = useMemo(() => extractList(usageRaw),  [usageRaw]);
  const materials: StoreMaterial[]    = useMemo(() => extractList(matsRaw),   [matsRaw]);

  const materialById = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials],
  );

  const filteredLogs = useMemo(() => {
    if (!dateFilter) return usageLogs;
    return usageLogs.filter((log) => safeDateSlice(log.usage_date) === dateFilter);
  }, [usageLogs, dateFilter]);

  const allOrders = useMemo(() =>
    usageLogs.flatMap((log) =>
      (log.orders ?? []).map((order: { material_id: number; order_quantity: number }) => {
        const mat = materialById.get(order.material_id);
        return {
          material_id:    order.material_id,
          order_quantity: order.order_quantity,
          usage_date:     log.usage_date,
          log_id:         log.id,
          material_name:  mat?.name ?? `Material #${order.material_id}`,
          material_unit:  mat?.unit?.symbol ?? mat?.unit?.name ?? '',
        };
      }),
    ),
    [usageLogs, materialById],
  );

  const filteredOrders = useMemo(() => {
    if (!dateFilter) return allOrders;
    return allOrders.filter((o) => safeDateSlice(o.usage_date) === dateFilter);
  }, [allOrders, dateFilter]);

  const isDataLoading = isUsageLoading || isMatsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Store Activity</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={resolvedSiteId}
          onChange={(id) => { setSelectedSiteId(id); setDateFilter(''); }}
          isLoading={isSitesLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--muted)] w-fit">
          {([
            { key: 'usage',  label: 'Daily Usage', icon: <ClipboardList size={14} /> },
            { key: 'orders', label: 'Orders',       icon: <ShoppingCart size={14} />  },
          ] as { key: ActivityTab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setDateFilter(''); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                  : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {isDataLoading && (
        <TableSkeleton cols={tab === 'usage' ? 3 : 3} rows={5} />
      )}

      {!isDataLoading && tab === 'usage' && (
        usageError && !usageLogs.length ? (
          <div className="gv-card flex flex-col items-center justify-center py-16 text-center
                          border-[color:var(--gv-border-danger)]">
            <AlertTriangle size={36} className="text-[color:var(--destructive)] opacity-40 mb-3" />
            <p className="text-sm text-[color:var(--muted-foreground)] mb-3">Failed to load usage logs.</p>
            <button
              onClick={refetchUsage}
              className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                         cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList size={36} className="text-[color:var(--muted-foreground)] opacity-20 mb-3" />
            <p className="text-sm text-[color:var(--muted-foreground)]">
              {dateFilter ? 'No usage logs for the selected date' : 'No daily usage logs for this site'}
            </p>
          </div>
        ) : (
          <div className="gv-card p-0 overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[20%]" />
                <col className="w-[45%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[color:var(--border)] bg-[color:var(--muted)]">
                  {['Material', 'Qty Used', 'Notes'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                           text-[color:var(--muted-foreground)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.flatMap((log) => {
                  if (!log.items?.length) return [];
                  return log.items.map((item, idx) => {
                    const unitSymbol = item.material?.unit?.symbol ?? item.material?.unit?.name ?? '';
                    return (
                      <tr
                        key={`${log.id}-${idx}`}
                        className="border-b border-[color:var(--border)] last:border-0
                                   hover:bg-[color:var(--accent)] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{item.material?.name ?? '—'}</td>
                        <td className="px-4 py-3 tabular-nums">
                          <span className="font-semibold">
                            {item.quantityUsed != null ? item.quantityUsed : '—'}
                          </span>
                          {unitSymbol && (
                            <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">
                              {unitSymbol}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                          {item.notes ?? '—'}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {!isDataLoading && tab === 'orders' && (
        usageError && !usageLogs.length ? (
          <div className="gv-card flex flex-col items-center justify-center py-16 text-center
                          border-[color:var(--gv-border-danger)]">
            <AlertTriangle size={36} className="text-[color:var(--destructive)] opacity-40 mb-3" />
            <p className="text-sm text-[color:var(--muted-foreground)] mb-3">Failed to load orders.</p>
            <button
              onClick={refetchUsage}
              className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                         cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart size={36} className="text-[color:var(--muted-foreground)] opacity-20 mb-3" />
            <p className="text-sm text-[color:var(--muted-foreground)]">
              {dateFilter ? 'No orders for the selected date' : 'No orders recorded for this site'}
            </p>
          </div>
        ) : (
          <div className="gv-card p-0 overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[45%]" />
                <col className="w-[25%]" />
                <col className="w-[30%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[color:var(--border)] bg-[color:var(--muted)]">
                  {['Material', 'Order Qty', 'Date Logged'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                           text-[color:var(--muted-foreground)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[color:var(--border)] last:border-0
                               hover:bg-[color:var(--accent)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[color:var(--muted)]
                                        flex items-center justify-center shrink-0">
                          <Package size={12} className="text-[color:var(--primary)]" />
                        </div>
                        {order.material_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className="font-semibold">{order.order_quantity}</span>
                      {order.material_unit && (
                        <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">
                          {order.material_unit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                      {fmtDate(order.usage_date, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

    </div>
  );
}