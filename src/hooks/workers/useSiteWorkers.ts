'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchWorkersBySite } from '@/lib/api/sites';
import type { SiteWorker } from '@/types/site';

export function useSiteWorkers(siteId: number | null) {
  const [workers, setWorkers] = useState<SiteWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (siteId == null) {
      setWorkers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkersBySite(siteId);
      setWorkers(data);
    } catch (err) {
      console.error('[useSiteWorkers] load failed:', err);
      setError('Failed to load workers for this site.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return { workers, loading, error, reload: load };
}