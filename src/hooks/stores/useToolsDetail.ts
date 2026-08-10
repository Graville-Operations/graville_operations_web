'use client';
import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useCachedLookup } from '@/hooks/useCachedLookup';
import { API } from '@/lib/endpoints';
import { fetchToolsPage } from '@/lib/api/store';
import { extractPagedList } from '@/lib/api-response';
import type { ToolItem, PagedResponse, Site } from '@/types/store';
import { ToolTab } from '@/types/enums/tool-tab';
const LIMIT = 20;
export const TOOL_TABS: { key: ToolTab; label: string }[] = [
  { key: ToolTab.ALL,       label: 'All'       },
  { key: ToolTab.AVAILABLE, label: 'Available' },
  { key: ToolTab.DAMAGED,   label: 'Damaged'   },
];

const TAB_STATUS: Record<ToolTab, string | undefined> = {
  all:       undefined,
  available: 'AVAILABLE',
  in_use:    'IN_USE',
  damaged:   'DAMAGED',
};

const TAB_OPTIONS: Record<ToolTab, { params: Record<string, unknown> }> = {
  all:       { params: { limit: LIMIT, skip: 0 } },
  available: { params: { limit: LIMIT, skip: 0, status: 'AVAILABLE' } },
  in_use:    { params: { limit: LIMIT, skip: 0, status: 'IN_USE' } },
  damaged:   { params: { limit: LIMIT, skip: 0, status: 'DAMAGED' } },
};

function extractList<T>(data: T[] | PagedResponse<T> | null | undefined): T[] {
  return extractPagedList(data);
}

export function useToolsDetail(siteId: number) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ToolTab | null) ?? ToolTab.ALL;
  const [activeTab, setActiveTab] = useState<ToolTab>(
    TOOL_TABS.some((t) => t.key === initialTab) ? initialTab : ToolTab.ALL,
  );
  const [extraItems, setExtraItems]   = useState<Partial<Record<ToolTab, ToolItem[]>>>({});
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: sitesRaw } = useCachedLookup<Site[] | { items: Site[] }>(API.sites.list);
  const sites: Site[] = useMemo(
    () => (sitesRaw ? (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw.items ?? [])) : []),
    [sitesRaw],
  );
  const siteName = sites.find((s) => s.id === siteId)?.name ?? 'Site';

  const { data, loading, error } = useApi<PagedResponse<ToolItem> | ToolItem[]>(
    API.stores.tools(siteId),
    TAB_OPTIONS[activeTab],
  );

  const firstPage = useMemo(() => extractList(data), [data]);
  const extra   = extraItems[activeTab] ?? [];
  const items   = extra.length > 0 ? [...firstPage, ...extra] : firstPage;
  const hasMore = items.length > 0 && items.length % LIMIT === 0;
  const status  = TAB_STATUS[activeTab];

  const handleTabChange = useCallback((tab: ToolTab) => {
    setActiveTab(tab);
    setExtraItems({});
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const list = await fetchToolsPage(siteId, items.length, LIMIT, status);
      setExtraItems((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] ?? []), ...list],
      }));
    } catch { /* silent */ }
    setLoadingMore(false);
  }, [siteId, activeTab, status, items.length]);

  return {
    siteName, activeTab, handleTabChange,
    items, loading, error, hasMore, loadingMore, loadMore,
  };
}