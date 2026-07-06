'use client';
import { useState, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { useCachedLookup } from '@/hooks/useCachedLookup';
import { API } from '@/lib/endpoints';
import { unwrapList } from '@/lib/api/store';
import type { Site, UsageLog } from '@/types/store';

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useStoreActivity() {
  const [startDate, setStartDate] = useState<string>(
    () => toLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [endDate, setEndDate] = useState<string>(() => toLocalDateString(new Date()));
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  const { data: sitesRaw, loading: isSitesLoading } = useCachedLookup<unknown>(API.sites.list);
  const sites = useMemo(() => unwrapList<Site>(sitesRaw), [sitesRaw]);

  const usageParams = useMemo(() => {
    const p: Record<string, unknown> = { limit: 100 };
    if (selectedSiteId) p.site_id   = selectedSiteId;
    if (startDate)      p.startDate = startDate;
    if (endDate)        p.endDate   = endDate;
    return p;
  }, [selectedSiteId, startDate, endDate]);

  const {
    data: usageRaw, loading: isUsageLoading, error: usageError, refetch,
  } = useApi<unknown>(API.stores.dailyUsageAll, { params: usageParams });

  const usageLogs = useMemo(() => unwrapList<UsageLog>(usageRaw), [usageRaw]);

  return {
    startDate, setStartDate,
    endDate, setEndDate,
    selectedSiteId, setSelectedSiteId,
    sites, isSitesLoading,
    usageLogs, isUsageLoading, usageError, refetch,
  };
}