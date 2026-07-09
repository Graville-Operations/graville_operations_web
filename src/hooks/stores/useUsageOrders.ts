'use client';
import { useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { API } from '@/lib/endpoints';
import { unwrapList } from '@/lib/api/store';

export function useUsageOrders(usageId: number) {
  const { data: raw, loading, error, refetch } = useApi<unknown>(API.stores.dailyUsageOrders(usageId));
  const orders = useMemo(() => unwrapList<Record<string, unknown>>(raw), [raw]);
  return { orders, loading, error, refetch };
}