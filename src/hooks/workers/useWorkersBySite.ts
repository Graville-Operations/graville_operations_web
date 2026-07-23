'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchWorkersBySite } from '@/lib/api/workers';
import type { WorkerBrief } from '@/types/worker-dashboard';

export function useWorkersBySite(siteId: number | null) {
  const [workers, setWorkers] = useState<WorkerBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!siteId) { setWorkers([]); setTotal(0); return; }
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await fetchWorkersBySite(siteId, 0, 50);
      setWorkers(items);
      setTotal(total);
    } catch (err) {
      console.error('[useWorkersBySite] load failed:', err);
      setError('Failed to load workers for this site.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return { workers, total, loading, error, load };
}