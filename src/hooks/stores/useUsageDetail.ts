'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { API } from '@/lib/endpoints';
import { unwrapRecord } from '@/lib/api/store';
import type { ActivityTab } from '@/types/store';

export function useUsageDetail(usageId: number) {
  const [tab, setTab] = useState<ActivityTab>('usage');
  const [tabReady, setTabReady] = useState(true);

  const { data: raw, loading, error, refetch } = useApi<unknown>(API.stores.dailyUsage(usageId));
  const log = useMemo(() => unwrapRecord(raw), [raw]);

  const handleTabChange = useCallback((next: ActivityTab) => {
    setTab((current) => {
      if (next === current) return current;
      setTabReady(false);
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setTabReady(true), 0);
    return () => clearTimeout(id);
  }, [tab]);

  return { tab, tabReady, handleTabChange, log, loading, error, refetch };
}