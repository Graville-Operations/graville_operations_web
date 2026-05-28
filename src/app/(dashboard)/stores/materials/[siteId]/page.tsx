'use client';
import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, AlertTriangle, ChevronLeft, Loader2 } from 'lucide-react';
import { useCachedApi } from '@/hooks/useCachedApi';
import type { MaterialItem, PagedResponse, Site } from '@/types/store';

const LIMIT = 20;

function extractList<T>(data: T[] | PagedResponse<T> | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export default function MaterialsPage() {
  const params   = useParams<{ siteId: string }>();
  const router   = useRouter();
  const siteId   = Number(params.siteId);

  const [allItems,     setAllItems]     = useState<MaterialItem[]>([]);
  const [skip,         setSkip]         = useState(0);
  const [loadingMore,  setLoadingMore]  = useState(false);

  const { data: sitesRaw } = useCachedApi<Site[] | { items: Site[] }>('/sites/list');
  const sites: Site[] = useMemo(() =>
    sitesRaw ? (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw.items ?? [])) : [],
    [sitesRaw],
  );
  const siteName = sites.find((s) => s.id === siteId)?.name ?? 'Site';

  const { data, loading, error } = useCachedApi<PagedResponse<MaterialItem> | MaterialItem[]>(
    `/store/materials/${siteId}/all`,
    { skip: 0, limit: LIMIT },
  );

  const firstPage = useMemo(() => extractList(data), [data]);
  const items     = skip === 0 ? firstPage : allItems;
  const hasMore   = items.length > 0 && items.length % LIMIT === 0;

  const loadMore = useCallback(async () => {
    const next = skip + LIMIT;
    setLoadingMore(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res  = await api.get(`/store/materials/${siteId}/all`, { params: { skip: next, limit: LIMIT } });
      const raw  = res.data?.data ?? res.data;
      const list: MaterialItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      setAllItems((prev) => [...prev, ...list]);
      setSkip(next);
    } catch { /* silent */ }
    setLoadingMore(false);
  }, [siteId, skip]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[color:var(--accent)] transition-colors flex-shrink-0"
        >
          <ChevronLeft size={18} className="text-[color:var(--muted-foreground)]" />
        </button>
        <div className="gv-icon-box flex-shrink-0">
          <Package size={16} className="text-[color:var(--primary)]" />
        </div>
        <h1 className="text-xl font-bold leading-none">Materials Details</h1>
        <span className="text-sm text-[color:var(--muted-foreground)] leading-none">· {siteName}</span>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[color:var(--primary)]" />
        </div>
      )}

      {!loading && error && !data && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={32} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)]">Failed to load materials.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <Package size={36} className="opacity-20 mb-3" />
          <p className="text-sm font-medium mb-1">No materials registered</p>
          <p className="text-xs text-[color:var(--muted-foreground)]">Add materials to this site to see them here.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="gv-card flex flex-col gap-0 p-0 overflow-hidden">
          <div
            className="grid gap-x-2 px-4 py-2.5 border-b border-[color:var(--border)] bg-[color:var(--muted)]"
            style={{ gridTemplateColumns: '1fr 1050px 72px' }}
          >
            <p className="text-[11px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide">Material</p>
            <p className="text-[11px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide text-center">Unit</p>
            <p className="text-[11px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide text-right">Qty</p>
          </div>

          <div className="divide-y divide-[color:var(--border)]">
            {items.map((m) => {
              const isLow = m.quantity <= m.minimum_stock;
              return (
                <div
                  key={m.id}
                  className="grid gap-x-2 items-center px-4 py-3 hover:bg-[color:var(--accent)] transition-colors"
                  style={{ gridTemplateColumns: '1fr 1050px 72px' }}
                >
                  <div>
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    {isLow && (
                      <p className="text-[11px] text-[color:var(--gv-text-warn)] mt-0.5 leading-none">
                        Low stock · min {m.minimum_stock.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-[color:var(--muted-foreground)] text-center">{m.unit.symbol}</p>
                  <p className={`text-sm font-semibold tabular-nums text-right ${isLow ? 'text-[color:var(--gv-text-warn)]' : 'text-[color:var(--foreground)]'}`}>
                    {m.quantity.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="px-4 py-3 border-t border-[color:var(--border)]">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full h-9 rounded-lg border border-[color:var(--border)] text-xs
                           text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] transition-colors
                           flex items-center justify-center gap-2 disabled:opacity-50"
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