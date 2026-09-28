'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { fetchSites } from '@/lib/api/sites';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';
import { API } from '@/lib/endpoints';
import { fetchMaterialsPage } from '@/lib/api/store';
import { extractPagedList } from '@/lib/api-response';
import type { MaterialItem, PagedResponse, Site } from '@/types/store';

const LIMIT = 20;
const FIRST_PAGE_OPTIONS = { params: { skip: 0, limit: LIMIT } };

function extractList<T>(data: T[] | PagedResponse<T> | null | undefined): T[] {
  return extractPagedList(data);
}

export function splitIntoThreeColumns<T>(items: T[]): [T[], T[], T[]] {
  const total = items.length;
  if (total === 0) return [[], [], []];
  const col1Size = Math.ceil(total / 3);
  const remaining = total - col1Size;
  const col2Size = Math.ceil(remaining / 2);
  const col1 = items.slice(0, col1Size);
  const col2 = items.slice(col1Size, col1Size + col2Size);
  const col3 = items.slice(col1Size + col2Size);
  return [col1, col2, col3];
}

export function useMaterialsDetail(siteId: number) {
  const [extraItems, setExtraItems] = useState<MaterialItem[]>([]);
  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // fetchSites() is cache-first against the shared ENTITY_CACHE_KEYS.sites
  // entry — the same one the Sites dashboard and every other site fetch use.
  const [sites, setSites] = useState<Site[]>(
    () => readEntityCache<Site[]>(ENTITY_CACHE_KEYS.sites) ?? [],
  );
  useEffect(() => {
    let cancelled = false;
    fetchSites().then((data) => { if (!cancelled) setSites(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const siteName = sites.find((s) => s.id === siteId)?.name ?? 'Site';

  const { data, loading, error } = useApi<PagedResponse<MaterialItem> | MaterialItem[]>(
    API.stores.materials(siteId),
    FIRST_PAGE_OPTIONS,
  );

  const firstPage = useMemo(() => extractList(data), [data]);
  const items = useMemo(
    () => (extraItems.length > 0 ? [...firstPage, ...extraItems] : firstPage),
    [firstPage, extraItems],
  );

  const [col1, col2, col3] = useMemo(() => splitIntoThreeColumns(items), [items]);
  const hasMore = items.length > 0 && items.length % LIMIT === 0;

  const loadMore = useCallback(async () => {
    const next = skip + LIMIT;
    setLoadingMore(true);
    try {
      const list = await fetchMaterialsPage(siteId, next, LIMIT);
      setExtraItems((prev) => [...prev, ...list]);
      setSkip(next);
    } catch {  }
    setLoadingMore(false);
  }, [siteId, skip]);

  return {
    siteName, items, col1, col2, col3,
    loading, error, hasMore, loadingMore, loadMore,
  };
}