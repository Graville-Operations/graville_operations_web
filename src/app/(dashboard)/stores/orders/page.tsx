'use client';
import { useState, useMemo } from 'react';
import {
  ChevronDown, ClipboardList, AlertTriangle,
  RefreshCw, ShoppingCart, Calendar, Package,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils/date';
import type { Site, ActivityTab } from '@/types/store';

function extractList<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.data))  return r.data  as T[];
  if (Array.isArray(r.items)) return r.items as T[];
  return [];
}

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
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

// ── Feedback states ───────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-16 text-center border-[color:var(--gv-border-danger)]">
      <AlertTriangle size={36} className="text-[color:var(--destructive)] opacity-40 mb-3" />
      <p className="text-sm text-[color:var(--muted-foreground)] mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)] cursor-pointer flex items-center gap-1.5 transition-colors"
      >
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[color:var(--muted-foreground)] opacity-20 mb-3">{icon}</div>
      <p className="text-sm text-[color:var(--muted-foreground)]">{message}</p>
    </div>
  );
}

// ── Controls ──────────────────────────────────────────────────────────────────
function SiteSelector({
  sites, selectedSiteId, onChange, isLoading,
}: {
  sites: Site[]; selectedSiteId: number | null; onChange: (id: number) => void; isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-64">
      <p className="gv-label">Viewing site</p>
      {isLoading ? (
        <div className="h-10 rounded-lg bg-[color:var(--gv-glass-bg)] relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
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
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--gv-text-subtle)] pointer-events-none" />
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
        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)] pointer-events-none" />
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

// ── Orders for a single usage record ─────────────────────────────────────────
function OrdersForRecord({ log }: { log: Record<string, unknown> }) {
  const { data: raw, loading, error, refetch } = useApi<unknown>(`/daily-usage/orders/${log.id}`);
  const orders = useMemo(() => extractList<Record<string, unknown>>(raw), [raw]);

  if (loading) return <TableSkeleton cols={3} rows={3} />;
  if (error)   return <ErrorState message={`Failed to load orders for ${formatDate(log.usage_date as string)}.`} onRetry={refetch} />;
  if (!orders.length) return null;

  return (
    <div className="gv-card p-0 overflow-hidden">
      <div className="px-4 py-2 bg-[color:var(--muted)] border-b border-[color:var(--border)] flex items-center gap-2">
        <Calendar size={12} className="text-[color:var(--muted-foreground)]" />
        <span className="text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-wider">
          {formatDate(log.usage_date as string)}
        </span>
      </div>
      <table className="w-full text-sm table-fixed">
        <colgroup><col className="w-[40%]" /><col className="w-[30%]" /><col className="w-[30%]" /></colgroup>
        <thead>
          <tr className="border-b border-[color:var(--border)] bg-[color:var(--muted)]/50">
            {['Material', 'Qty Ordered', 'Requested By'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => {
            const mat   = order.material     as Record<string, unknown> | undefined;
            const unit  = mat?.unit          as Record<string, unknown> | undefined;
            const reqBy = order.requested_by as Record<string, unknown> | undefined;
            return (
              <tr key={idx} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--accent)] transition-colors">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[color:var(--muted)] flex items-center justify-center shrink-0">
                      <Package size={12} className="text-[color:var(--primary)]" />
                    </div>
                    {(mat?.name as string) ?? '—'}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className="font-semibold">{order.quantity as number}</span>
                  <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">
                    {(unit?.symbol as string) ?? (unit?.name as string) ?? ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                  {(reqBy?.name as string) ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StoreActivityPage() {
  const [tab,            setTab]            = useState<ActivityTab>('usage');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [dateFilter,     setDateFilter]     = useState(() => toLocalDateString(new Date()));

  const { data: sitesRaw, loading: isSitesLoading } = useApi<unknown>('/sites/list');
  const sites = useMemo(() => extractList<Site>(sitesRaw), [sitesRaw]);
  const resolvedSiteId = selectedSiteId ?? sites[0]?.id ?? null;

  // ⚠️  Adjust param names below to match your backend if needed
  const usageParams = useMemo(() => {
    const p: Record<string, unknown> = { site_id: resolvedSiteId, limit: 100 };
    if (dateFilter) {
      p.start_date = dateFilter;
      p.end_date   = dateFilter;
    }
    return p;
  }, [resolvedSiteId, dateFilter]);

  const {
    data: usageRaw,
    loading: isUsageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useApi<unknown>('/daily-usage/all', {
    enabled: resolvedSiteId !== null,
    params: usageParams,
  });

  const usageLogs = useMemo(() => extractList<Record<string, unknown>>(usageRaw), [usageRaw]);

  // Flatten all usage items across every log record, trying every plausible key name
  const allUsageItems = useMemo(() =>
    usageLogs.flatMap((log) => {
      const items =
        (log.usage_items as unknown[]) ??
        (log.items        as unknown[]) ??
        (log.materials    as unknown[]) ??
        (log.entries      as unknown[]) ??
        [];
      return (items as Record<string, unknown>[]).map((item) => ({
        ...item,
        _log_id:   log.id,
        _log_date: log.usage_date,
      }));
    }),
    [usageLogs],
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Store Activity</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={resolvedSiteId}
          onChange={(id) => { setSelectedSiteId(id); setDateFilter(toLocalDateString(new Date())); }}
          isLoading={isSitesLoading}
        />
      </div>

      {/* Tab bar + date filter */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--muted)] w-fit">
          {([
            { key: 'usage',  label: 'Daily Usage', icon: <ClipboardList size={14} /> },
            { key: 'orders', label: 'Orders',       icon: <ShoppingCart  size={14} /> },
          ] as { key: ActivityTab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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

      {/* Loading skeleton */}
      {isUsageLoading && <TableSkeleton cols={3} rows={5} />}

      {/* ── Daily Usage tab ── */}
      {!isUsageLoading && tab === 'usage' && (
        usageError && !usageLogs.length ? (
          <ErrorState message="Failed to load usage logs." onRetry={refetchUsage} />
        ) : allUsageItems.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={36} />}
            message={dateFilter ? 'No usage logs for the selected date' : 'No daily usage logs for this site'}
          />
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
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allUsageItems.map((item, idx) => {
                  const mat        = item.material as Record<string, unknown> | undefined;
                  const unit       = mat?.unit as Record<string, unknown> | undefined;
                  const qty        = item.quantity_used ?? item.quantity ?? item.qty_used ?? item.qty ?? '—';
                  const unitSymbol = (unit?.symbol as string) ?? (unit?.name as string) ?? '';
                  return (
                    <tr
                      key={`${item._log_id}-${idx}`}
                      className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--accent)] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{(mat?.name as string) ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="font-semibold">{qty as string}</span>
                        {unitSymbol && (
                          <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">{unitSymbol}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                        {(item.notes as string) ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Orders tab ── */}
      {!isUsageLoading && tab === 'orders' && (
        usageError && !usageLogs.length ? (
          <ErrorState message="Failed to load orders." onRetry={refetchUsage} />
        ) : usageLogs.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={36} />}
            message={dateFilter ? 'No orders for the selected date' : 'No orders recorded for this site'}
          />
        ) : (
          <div className="space-y-4">
            {usageLogs.map((log) => (
              <OrdersForRecord key={log.id as number} log={log} />
            ))}
          </div>
        )
      )}

    </div>
  );
}