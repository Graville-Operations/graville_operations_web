'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { fetchSites } from '@/lib/api/sites';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
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

  const usageLogs = useMemo(() => unwrapArray<UsageLog>(usageRaw), [usageRaw]);

  return {
    startDate, setStartDate,
    endDate, setEndDate,
    selectedSiteId, setSelectedSiteId,
    sites, isSitesLoading,
    usageLogs, isUsageLoading, usageError, refetch,
  };
}