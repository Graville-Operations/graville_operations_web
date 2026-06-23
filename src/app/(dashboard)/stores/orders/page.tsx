'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, AlertTriangle, RefreshCw,
  ClipboardList, Calendar, Package, ChevronRight,
  Layers, CheckCircle2, Clock, FileEdit, Building2,
  ShoppingCart,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useCachedLookup } from '@/hooks/useCachedLookup';
import type { Site } from '@/types/store';

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

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type UsageStatus = 'draft' | 'submitted' | 'approved' | 'pending_edit' | string;

interface UsageLog {
  id: number;
  site_name: string;
  date: string;
  notes: string;
  materials_count: number;
  orders_count: number;
  status?: UsageStatus;
}

function statusMeta(status: UsageStatus | undefined): { label: string; color: string; icon: React.ReactNode } {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return { label: 'Submitted', color: 'var(--primary)', icon: <CheckCircle2 size={10} /> };
    case 'approved':
      return { label: 'Approved', color: '#22c55e', icon: <CheckCircle2 size={10} /> };
    case 'pending_edit':
      return { label: 'Edit Pending', color: '#f59e0b', icon: <FileEdit size={10} /> };
    default:
      return { label: 'Draft', color: 'var(--muted-foreground)', icon: <Clock size={10} /> };
  }
}

function TileSkeleton() {
  return (
    <div className="gv-card p-0 overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-[color:var(--muted)] rounded w-28" />
          <div className="h-5 bg-[color:var(--muted)] rounded-full w-20" />
        </div>
        <div className="h-3 bg-[color:var(--muted)] rounded w-40" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 bg-[color:var(--muted)] rounded w-16" />
          <div className="h-6 bg-[color:var(--muted)] rounded w-16" />
        </div>
      </div>
      <div className="px-4 py-2 border-t border-[color:var(--border)] bg-[color:var(--muted)]/30 flex justify-between items-center">
        <div className="h-3 bg-[color:var(--muted)] rounded w-24" />
        <div className="h-3 bg-[color:var(--muted)] rounded w-8" />
      </div>
    </div>
  );
}

function TileSkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => <TileSkeleton key={i} />)}
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

function EmptyState() {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[color:var(--muted)] flex items-center justify-center mb-4">
        <ClipboardList size={24} className="text-[color:var(--muted-foreground)] opacity-40" />
      </div>
      <p className="text-sm font-medium text-[color:var(--foreground)]">No usage reports found</p>
      <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
        Try adjusting the site or date filter
      </p>
    </div>
  );
}

function SiteSelector({
  sites, selectedSiteId, onChange, isLoading,
}: {
  sites: Site[];
  selectedSiteId: number | null;
  onChange: (id: number | null) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-64">
      <p className="gv-label">Filter by site</p>
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
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="">All Sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--gv-text-subtle)] pointer-events-none" />
        </div>
      )}
    </div>
  );
}

function DateRangeFilter({
  startDate, endDate, onStartChange, onEndChange,
}: {
  startDate: string; endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="gv-label">Date range</p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)] pointer-events-none" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="pl-8 pr-3 h-10 rounded-lg border border-[color:var(--border)]
                       bg-[color:var(--gv-glass-bg)] text-[color:var(--foreground)] text-sm
                       outline-none transition-colors focus:border-[color:var(--gv-glass-border-hover)]
                       hover:border-[color:var(--gv-glass-border)] cursor-pointer"
          />
        </div>
        <span className="text-xs text-[color:var(--muted-foreground)]">to</span>
        <div className="relative">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)] pointer-events-none" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="pl-8 pr-3 h-10 rounded-lg border border-[color:var(--border)]
                       bg-[color:var(--gv-glass-bg)] text-[color:var(--foreground)] text-sm
                       outline-none transition-colors focus:border-[color:var(--gv-glass-border-hover)]
                       hover:border-[color:var(--gv-glass-border)] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function UsageTile({ log, onClick }: { log: UsageLog; onClick: () => void }) {
  const status = statusMeta(log.status);

  return (
    <button
      onClick={onClick}
      className="gv-card p-0 overflow-hidden text-left w-full group
                 hover:border-[color:var(--gv-glass-border-hover)]
                 hover:shadow-[0_4px_24px_rgba(0,0,0,0.18)]
                 transition-all duration-200 cursor-pointer"
    >

      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${status.color}55, transparent)` }}
      />

      <div className="p-4 space-y-3">

        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold leading-tight">{log.date}</p>
            <p className="text-[11px] text-[color:var(--muted-foreground)] mt-0.5 flex items-center gap-1">
              <Building2 size={10} />
              {log.site_name}
            </p>
          </div>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
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

        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-[color:var(--muted)] text-[color:var(--muted-foreground)]">
            <Package size={9} />
            {log.materials_count} material{log.materials_count !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-[color:var(--muted)] text-[color:var(--muted-foreground)]">
            <ShoppingCart size={9} />
            {log.orders_count} order{log.orders_count !== 1 ? 's' : ''}
          </span>
        </div>

        {log.notes && log.notes !== 'string' && (
          <p className="text-[11px] text-[color:var(--muted-foreground)] italic line-clamp-1">
            {log.notes}
          </p>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[color:var(--border)] bg-[color:var(--muted)]/30
                      flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-[color:var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Layers size={10} />
            {log.materials_count + log.orders_count} total entries
          </span>
        </div>
        <ChevronRight
          size={13}
          className="text-[color:var(--muted-foreground)] group-hover:text-[color:var(--foreground)]
                     group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}

export default function StoreActivityPage() {
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>(
    () => toLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [endDate, setEndDate] = useState<string>(
    () => toLocalDateString(new Date()),
  );

  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const { data: sitesRaw, loading: isSitesLoading } = useCachedLookup<unknown>('/sites/list');
  const sites = useMemo(() => extractList<Site>(sitesRaw), [sitesRaw]);

  const usageParams = useMemo(() => {
    const p: Record<string, unknown> = { limit: 100 };
    if (selectedSiteId) p.site_id   = selectedSiteId;
    if (startDate)      p.startDate = startDate;
    if (endDate)        p.endDate   = endDate;
    return p;
  }, [selectedSiteId, startDate, endDate]);

  const {
    data: usageRaw,
    loading: isUsageLoading,
    error: usageError,
    refetch,
  } = useApi<unknown>('/daily-usage/all', { params: usageParams });

  const usageLogs = useMemo(
    () => extractList<UsageLog>(usageRaw),
    [usageRaw],
  );

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Store Activity</h1>
          <p className="text-lg text-[color:var(--muted-foreground)] mt-1">
            Daily usage reports across all sites
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <SiteSelector
          sites={sites}
          selectedSiteId={selectedSiteId}
          onChange={setSelectedSiteId}
          isLoading={isSitesLoading}
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      {!isUsageLoading && !usageError && usageLogs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
          <ClipboardList size={12} />
          <span>
            Showing{' '}
            <span className="font-semibold text-[color:var(--foreground)]">{usageLogs.length}</span>{' '}
            report{usageLogs.length !== 1 ? 's' : ''}
            {selectedSiteId ? ' for selected site' : ' across all sites'}
          </span>
        </div>
      )}

      {isUsageLoading && <TileSkeletonGrid />}

      {!isUsageLoading && usageError && (
        <ErrorState message="Failed to load usage reports." onRetry={refetch} />
      )}

      {!isUsageLoading && !usageError && usageLogs.length === 0 && <EmptyState />}

      {!isUsageLoading && !usageError && usageLogs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {usageLogs.map((log) => (
            <UsageTile
              key={log.id}
              log={log}
              onClick={() => router.push(`/stores/orders/${log.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  );
}