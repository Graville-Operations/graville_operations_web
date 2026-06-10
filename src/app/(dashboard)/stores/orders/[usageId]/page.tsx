'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle, RefreshCw, ClipboardList,
  ShoppingCart, Package, Calendar, ArrowLeft,
  CheckCircle2, Clock, FileEdit, Building2,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { ActivityTab } from '@/types/store';

function extractList<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) return d.items as T[];
    if (Array.isArray(d.data))  return d.data  as T[];
  }
  if (Array.isArray(r.data))  return r.data  as T[];
  if (Array.isArray(r.items)) return r.items as T[];
  return [];
}

function extractRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data))
    return r.data as Record<string, unknown>;
  return r;
}

type UsageStatus = 'draft' | 'submitted' | 'approved' | 'pending_edit' | string;

function statusMeta(status: UsageStatus | undefined): { label: string; color: string; icon: React.ReactNode } {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return { label: 'Submitted', color: 'var(--primary)',        icon: <CheckCircle2 size={11} /> };
    case 'approved':
      return { label: 'Approved',  color: '#22c55e',               icon: <CheckCircle2 size={11} /> };
    case 'pending_edit':
      return { label: 'Edit Pending', color: '#f59e0b',            icon: <FileEdit     size={11} /> };
    default:
      return { label: 'Draft',     color: 'var(--muted-foreground)', icon: <Clock      size={11} /> };
  }
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

function HeaderSkeleton() {
  return (
    <div className="gv-card p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-[color:var(--muted)] rounded w-36" />
        <div className="h-5 bg-[color:var(--muted)] rounded-full w-24" />
      </div>
      <div className="h-3 bg-[color:var(--muted)] rounded w-48" />
    </div>
  );
}

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

function DetailHeader({ log }: { log: Record<string, unknown> }) {
  const status   = statusMeta(log.status as UsageStatus);
  const site     = log.site as Record<string, unknown> | undefined;
  const siteName = (site?.name as string) ?? '—';
  const items    = (log.items as unknown[]) ?? [];

  return (
    <div className="gv-card p-0 overflow-hidden">
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${status.color}66, transparent)` }}
      />
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[color:var(--muted-foreground)]" />
            <span className="font-semibold">{(log.date as string) ?? '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[color:var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <Building2 size={11} />{siteName}
            </span>
            <span>{items.length} material{items.length !== 1 ? 's' : ''}</span>
            {log.created_at && (
              <span>Created {log.created_at as string}</span>
            )}
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto"
          style={{
            color: status.color,
            background: `color-mix(in srgb, ${status.color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${status.color} 25%, transparent)`,
          }}
        >
          {status.icon}
          {status.label}
        </span>
      </div>
    </div>
  );
}

function DailyUsageTab({ log }: { log: Record<string, unknown> }) {
  const items = useMemo(
    () => ((log.items as unknown[]) ?? []) as Record<string, unknown>[],
    [log],
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={36} />}
        message="No materials recorded for this report"
      />
    );
  }

  return (
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
          {items.map((item, idx) => {
            const mat        = item.material as Record<string, unknown> | undefined;
            const unit       = mat?.unit     as Record<string, unknown> | undefined;
            const unitSymbol = (unit?.symbol as string) ?? (unit?.name as string) ?? '';

            const qty        = item.quantityUsed ?? '—';
            return (
              <tr
                key={item.id as number ?? idx}
                className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--accent)] transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[color:var(--muted)] flex items-center justify-center shrink-0">
                      <Package size={12} className="text-[color:var(--primary)]" />
                    </div>
                    {(mat?.name as string) ?? '—'}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className="font-semibold">{qty as string | number}</span>
                  {unitSymbol && (
                    <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">{unitSymbol}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                  {(item.notes as string) || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTab({ usageId }: { usageId: number }) {
  const { data: raw, loading, error, refetch } = useApi<unknown>(`/daily-usage/orders/${usageId}`);
  const orders = useMemo(() => extractList<Record<string, unknown>>(raw), [raw]);

  if (loading) return <TableSkeleton cols={3} rows={4} />;
  if (error)   return <ErrorState message="Failed to load orders for this report." onRetry={refetch} />;
  if (!orders.length) {
    return (
      <EmptyState
        icon={<ShoppingCart size={36} />}
        message="No orders recorded for this report"
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[25%]" />
          <col className="w-[35%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[color:var(--border)] bg-[color:var(--muted)]">
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
   
            const qty   = order.quantityOrdered ?? order.quantity_ordered ?? order.quantity ?? '—';
            return (
              <tr
                key={order.id as number ?? idx}
                className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--accent)] transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[color:var(--muted)] flex items-center justify-center shrink-0">
                      <Package size={12} className="text-[color:var(--primary)]" />
                    </div>
                    {(mat?.name as string) ?? '—'}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className="font-semibold">{qty as string | number}</span>
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

export default function StoreActivityDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const usageId = Number(params.usageId);

  const [tab, setTab] = useState<ActivityTab>('usage');

  const { data: raw, loading, error, refetch } = useApi<unknown>(`/daily-usage/${usageId}`);
  const log = useMemo(() => extractRecord(raw), [raw]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     bg-[color:var(--muted)] hover:bg-[color:var(--accent)]
                     text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]
                     transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <p className="gv-eyebrow">Store · Activity</p>
          <h1 className="text-2xl font-bold mt-0.5">Usage Report</h1>
        </div>
      </div>

      {/* Detail header card */}
      {loading && <HeaderSkeleton />}
      {!loading && error && (
        <ErrorState message="Failed to load this usage report." onRetry={refetch} />
      )}
      {!loading && !error && log && <DetailHeader log={log} />}

      {!loading && !error && log && (
        <>
          <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--muted)] w-fit">
            {([
              { key: 'usage',  label: 'Daily Usage', icon: <ClipboardList size={14} /> },
              { key: 'orders', label: 'Orders',       icon: <ShoppingCart  size={14} /> },
            ] as { key: ActivityTab; label: string; icon: React.ReactNode }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  tab === t.key
                    ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                    : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {tab === 'usage'  && <DailyUsageTab log={log} />}
          {tab === 'orders' && <OrdersTab usageId={usageId} />}
        </>
      )}

    </div>
  );
}