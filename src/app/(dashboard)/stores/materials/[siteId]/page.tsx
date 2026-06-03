'use client';
import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, AlertTriangle, ChevronLeft, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { MaterialItem, PagedResponse, Site } from '@/types/store';

const LIMIT = 20;

function extractList<T>(data: T[] | PagedResponse<T> | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}


function TableSkeleton() {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[68%]" />
          <col className="w-[32%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[color:var(--border)] bg-[color:var(--muted)]">
            <th className="text-left px-6 py-3 text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-wider">
              Material
            </th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-wider">
              Quantity
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-[color:var(--border)] last:border-0">
              <td className="px-6 py-4">
                {/* Shimmer bars */}
                <div className="relative overflow-hidden h-4 bg-[color:var(--muted)] rounded w-[85%]">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                                  bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
                <div className="relative overflow-hidden h-3 bg-[color:var(--muted)] rounded w-32 mt-2">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                                  bg-gradient-to-r from-transparent via-white/5 to-transparent"
                       style={{ animationDelay: `${i * 60}ms` }} />
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="relative overflow-hidden h-4 bg-[color:var(--muted)] rounded w-20 ml-auto">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                                  bg-gradient-to-r from-transparent via-white/5 to-transparent"
                       style={{ animationDelay: `${i * 80}ms` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default function MaterialsPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const siteId = Number(params.siteId);

  const [extraItems,  setExtraItems]  = useState<MaterialItem[]>([]);
  const [skip,        setSkip]        = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: sitesRaw } = useApi<Site[] | { items: Site[] }>('/sites/list');
  const sites: Site[] = useMemo(
    () => sitesRaw ? (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw.items ?? [])) : [],
    [sitesRaw],
  );
  const siteName = sites.find((s) => s.id === siteId)?.name ?? 'Site';

  const { data, loading, error } = useApi<PagedResponse<MaterialItem> | MaterialItem[]>(
    `/store/materials/${siteId}/all`,
    { params: { skip: 0, limit: LIMIT } },
  );

  const firstPage = useMemo(() => extractList(data), [data]);
  const items     = useMemo(
    () => (extraItems.length > 0 ? [...firstPage, ...extraItems] : firstPage),
    [firstPage, extraItems],
  );

  const hasMore = items.length > 0 && items.length % LIMIT === 0;

  const loadMore = useCallback(async () => {
    const next = skip + LIMIT;
    setLoadingMore(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res  = await api.get(`/store/materials/${siteId}/all`, {
        params: { skip: next, limit: LIMIT },
      });
      const raw  = res.data?.data ?? res.data;
      const list: MaterialItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      setExtraItems((prev) => [...prev, ...list]);
      setSkip(next);
    } catch {  }
    setLoadingMore(false);
  }, [siteId, skip]);

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     hover:bg-[color:var(--accent)] transition-colors flex-shrink-0"
        >
          <ChevronLeft size={18} className="text-[color:var(--muted-foreground)]" />
        </button>
        <div className="gv-icon-box flex-shrink-0">
          <Package size={16} className="text-[color:var(--primary)]" />
        </div>
        <h1 className="text-xl font-bold leading-none">Materials Details</h1>
        <span className="text-sm text-[color:var(--muted-foreground)] leading-none">· {siteName}</span>
      </div>

      {loading && !data && <TableSkeleton />}

      {!loading && error && !data && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={32} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)]">Failed to load materials.</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && items.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <Package size={36} className="opacity-20 mb-3" />
          <p className="text-sm font-medium mb-1">No materials registered</p>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            Add materials to this site to see them here.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="gv-card p-0 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[68%]" />
              <col className="w-[32%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[color:var(--border)] bg-[color:var(--muted)]">
                <th className="text-left px-6 py-3 text-xs font-semibold
                               text-[color:var(--muted-foreground)] uppercase tracking-wider">
                  Material
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold
                               text-[color:var(--muted-foreground)] uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => {
                const isLow       = m.quantity <= m.minimum_stock;
                const unitSymbol  = m.unit?.symbol ?? m.unit?.name ?? '';
                return (
                  <tr
                    key={m.id}
                    className="border-b border-[color:var(--border)] last:border-0
                               hover:bg-[color:var(--accent)] transition-colors"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium truncate">{m.name}</p>
                      {isLow && (
                        <p className="text-[11px] text-[color:var(--gv-text-warn)] mt-0.5 leading-none">
                          Low stock · min {m.minimum_stock.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      <span className={`font-semibold ${
                        isLow ? 'text-[color:var(--gv-text-warn)]' : 'text-[color:var(--foreground)]'
                      }`}>
                        {m.quantity.toLocaleString()}
                      </span>
                      {unitSymbol && (
                        <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">
                          {unitSymbol}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {hasMore && (
            <div className="px-6 py-3 border-t border-[color:var(--border)]">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full h-9 rounded-lg border border-[color:var(--border)] text-xs
                           text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)]
                           transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? <Loader2 size={13} className="animate-spin" /> : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}