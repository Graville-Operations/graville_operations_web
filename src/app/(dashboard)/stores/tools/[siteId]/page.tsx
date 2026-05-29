'use client';
import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Activity, AlertTriangle, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useCachedApi } from '@/hooks/useCachedApi';
import type { ToolItem, PagedResponse, Site, ToolTab } from '@/types/store';

const LIMIT = 20;

const TOOL_TABS: { key: ToolTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'available', label: 'Available' },
  { key: 'damaged',   label: 'Damaged'   },
];

const TAB_STATUS: Record<ToolTab, string | undefined> = {
  all:       undefined,
  available: 'AVAILABLE',
  in_use:    'IN_USE',   
  damaged:   'DAMAGED',
};

const TOOL_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'text-[color:var(--gv-text-success)]',
  IN_USE:    'text-[color:var(--gv-text-info)]',
  DAMAGED:   'text-[color:var(--destructive)]',
};

const TOOL_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Available',
  IN_USE:    'In Use',
  DAMAGED:   'Damaged',
};

function extractList<T>(data: T[] | PagedResponse<T> | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export default function ToolsPage() {
  const params        = useParams<{ siteId: string }>();
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const siteId        = Number(params.siteId);

  const initialTab = (searchParams.get('tab') as ToolTab | null) ?? 'all';
  const [activeTab,   setActiveTab]   = useState<ToolTab>(
    TOOL_TABS.some((t) => t.key === initialTab) ? initialTab : 'all',
  );
  const [extraItems,  setExtraItems]  = useState<Partial<Record<ToolTab, ToolItem[]>>>({});
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: sitesRaw } = useCachedApi<Site[] | { items: Site[] }>('/sites/list');
  const sites: Site[] = useMemo(() =>
    sitesRaw ? (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw.items ?? [])) : [],
    [sitesRaw],
  );
  const siteName = sites.find((s) => s.id === siteId)?.name ?? 'Site';

  const status = TAB_STATUS[activeTab];

  const { data, loading, error } = useCachedApi<PagedResponse<ToolItem> | ToolItem[]>(
    `/store/tools/${siteId}/all`,
    { limit: LIMIT, skip: 0, ...(status ? { status } : {}) },
  );

  const firstPage = useMemo(() => extractList(data), [data]);
  const extra     = extraItems[activeTab] ?? [];
  const items     = extra.length > 0 ? extra : firstPage;
  const hasMore   = items.length > 0 && items.length % LIMIT === 0;

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res  = await api.get(`/store/tools/${siteId}/all`, {
        params: { skip: items.length, limit: LIMIT, ...(status ? { status } : {}) },
      });
      const raw  = res.data?.data ?? res.data;
      const list: ToolItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      setExtraItems((prev) => ({ ...prev, [activeTab]: [...items, ...list] }));
    } catch { /* silent */ }
    setLoadingMore(false);
  }, [siteId, activeTab, status, items]);

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
          <Activity size={16} className="text-[color:var(--primary)]" />
        </div>
        <h1 className="text-xl font-bold leading-none">Tools</h1>
        <span className="text-sm text-[color:var(--muted-foreground)] leading-none">· {siteName}</span>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--muted)]">
        {TOOL_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 h-7 rounded-md text-xs font-medium transition-all ${
              activeTab === t.key
                ? 'bg-[color:var(--accent)] text-[color:var(--foreground)]'
                : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[color:var(--primary)]" />
        </div>
      )}

      {!loading && error && !data && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={32} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)]">Failed to load tools.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 size={36} className="opacity-20 mb-3" />
          <p className="text-sm font-medium mb-1">No tools in this category</p>
          <p className="text-xs text-[color:var(--muted-foreground)]">Try switching to a different tab.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="gv-card flex flex-col gap-0 p-0 overflow-hidden">
          <div
            className="grid gap-x-2 px-4 py-2.5 border-b border-[color:var(--border)] bg-[color:var(--muted)]"
            style={{ gridTemplateColumns: '1fr 1fr 90px' }}
          >
            <p className="text-[11px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide">Name</p>
            <p className="text-[11px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide">Vendor</p>
            <p className="text-[11px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide text-right">Status</p>
          </div>

          <div className="divide-y divide-[color:var(--border)]">
            {items.map((t) => (
              <div
                key={t.id}
                className="grid gap-x-2 items-center px-4 py-3 hover:bg-[color:var(--accent)] transition-colors"
                style={{ gridTemplateColumns: '1fr 1fr 90px' }}
              >
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-sm text-[color:var(--muted-foreground)] truncate">{t.vendor ?? '—'}</p>
                <span className={`text-xs font-medium text-right ${TOOL_STATUS_COLOR[t.status] ?? 'text-[color:var(--muted-foreground)]'}`}>
                  {TOOL_STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
            ))}
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