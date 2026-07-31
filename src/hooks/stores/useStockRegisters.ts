'use client';
import { useState, useMemo, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { useCachedLookup } from '@/hooks/useCachedLookup';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import type { Site, StoreMaterial, StoreTool, StockTab, StoreSummary } from '@/types/store';

export function useStockRegisters() {
  const [tab, setTab] = useState<StockTab>('materials');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: sitesRaw, loading: isSitesLoading } = useCachedLookup<unknown>(API.sites.list);
  const sites = useMemo(() => unwrapArray<Site>(sitesRaw), [sitesRaw]);
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