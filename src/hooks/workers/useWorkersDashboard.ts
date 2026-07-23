'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchWorkerTypes, createWorkerType } from '@/lib/api/workers';
import type { WorkerType, SkillType } from '@/types/worker-dashboard';

export function useWorkersDashboard() {
  const [workerTypes, setWorkerTypes] = useState<WorkerType[]>([]);
  const [totalWorkerTypes, setTotalWorkerTypes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await fetchWorkerTypes(0, 20);
      setWorkerTypes(items);
      setTotalWorkerTypes(total);
    } catch (err) {
      console.error('[useWorkersDashboard] load failed:', err);
      setError('Failed to load worker types.');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const addWorkerType = useCallback(
    async (payload: { name: string; amount: number; skill: SkillType }) => {
      const created = await createWorkerType(payload);
      setWorkerTypes(prev => [...prev, created]);
      setTotalWorkerTypes(prev => prev + 1);
      return created;
    },
    []
  );

  return { workerTypes, totalWorkerTypes, loading, error, load, addWorkerType };
}