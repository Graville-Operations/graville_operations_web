'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { API } from '@/lib/endpoints';
import { unwrapObject } from '@/lib/api-response';
import type { ActivityTab } from '@/types/store';

export function useUsageDetail(usageId: number) {
  const [tab, setTab] = useState<ActivityTab>('usage');
  const [tabReady, setTabReady] = useState(true);

  const { data: raw, loading, error, refetch } = useApi<unknown>(API.stores.dailyUsage(usageId));
  const log = useMemo(() => unwrapObject<Record<string, unknown>>(raw), [raw]);

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