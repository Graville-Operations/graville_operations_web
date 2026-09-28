'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { fetchSites } from '@/lib/api/sites';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import type { Site, StoreMaterial, StoreTool, StoreSummary } from '@/types/store';
import { StockTab } from '@/types/enums/stock-tab';

export function useStockRegisters() {
 const [tab, setTab] = useState<StockTab>(StockTab.MATERIALS);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // fetchSites() is cache-first against the shared ENTITY_CACHE_KEYS.sites
  // entry — the same one the Sites dashboard and every other site fetch use.
  const [sites, setSites] = useState<Site[]>(
    () => readEntityCache<Site[]>(ENTITY_CACHE_KEYS.sites) ?? [],
  );
  const [isSitesLoading, setIsSitesLoading] = useState<boolean>(
    () => readEntityCache<Site[]>(ENTITY_CACHE_KEYS.sites) === null,
  );
  useEffect(() => {
    let cancelled = false;
    fetchSites()
      .then((data) => { if (!cancelled) setSites(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsSitesLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const resolvedSiteId = selectedSiteId ?? sites[0]?.id ?? null;
  const siteEnabled = resolvedSiteId !== null;

  const { data: summary, loading: isSummaryLoading } = useApi<StoreSummary>(
    API.stores.summary(resolvedSiteId ?? 0),
    { enabled: siteEnabled },
  );

  const {
    data: matsRaw, loading: isMatsLoading, error: matsError, refetch: refetchMats,
  } = useApi<unknown>(API.stores.materials(resolvedSiteId ?? 0), { enabled: siteEnabled });

  const {
    data: toolsRaw, loading: isToolsLoading, error: toolsError, refetch: refetchTools,
  } = useApi<unknown>(API.stores.tools(resolvedSiteId ?? 0), { enabled: siteEnabled });

  const materials = useMemo(() => unwrapArray<StoreMaterial>(matsRaw), [matsRaw]);
  const tools     = useMemo(() => unwrapArray<StoreTool>(toolsRaw), [toolsRaw]);

  const q = search.toLowerCase();
  const filteredMaterials = useMemo(
    () => materials.filter((m) => m.name.toLowerCase().includes(q)),
    [materials, q],
  );
  const filteredTools = useMemo(
    () => tools.filter((t) => t.name.toLowerCase().includes(q)),
    [tools, q],
  );

  const lowCount = useMemo(
    () => materials.filter((m) => m.minimumStockLevel != null && m.quantity <= m.minimumStockLevel).length,
    [materials],
  );
  const outCount = useMemo(() => materials.filter((m) => m.quantity === 0).length, [materials]);
  const availTool = useMemo(
    () => tools.filter((t) => t.status?.toUpperCase() === 'AVAILABLE').length,
    [tools],
  );
  const overdueTool = useMemo(
    () => tools.filter((t) => (t as unknown as Record<string, unknown>).is_overdue === true).length,
    [tools],
  );
  const damagedTools = useMemo(
    () => tools.filter((t) => t.status?.toUpperCase() === 'DAMAGED').length,
    [tools],
  );

  const showCardSkeletons = isSummaryLoading || (isSitesLoading && !summary);
  const isCurrentLoading = tab === 'materials'
    ? (isMatsLoading && !materials.length)
    : (isToolsLoading && !tools.length);
  const isCurrentError = tab === 'materials'
    ? (!!matsError && !materials.length)
    : (!!toolsError && !tools.length);

  const handleTabChange  = useCallback((t: StockTab) => { setTab(t); setSearch(''); }, []);
  const handleSiteChange = useCallback((id: number) => { setSelectedSiteId(id); setSearch(''); }, []);

  return {
    sites, isSitesLoading, resolvedSiteId, handleSiteChange,
    tab, handleTabChange, search, setSearch,
    summary, showCardSkeletons,
    materials, tools, filteredMaterials, filteredTools,
    lowCount, outCount, availTool, overdueTool, damagedTools,
    isCurrentLoading, isCurrentError,
    refetchMats, refetchTools,
  };
}