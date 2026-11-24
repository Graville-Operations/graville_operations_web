'use client';
import { useEffect, useState } from 'react';
import { fetchAllSiteWorkers, fetchSiteWorkerDetail } from '@/lib/api/site-workers';
import type { SiteWorkerRow } from '@/types/site-worker-detail';

const CONCURRENCY = 6;

/**
 * Loads every worker on a site, then fills in phone / national id /
 * check-in count from /workers/details/{id} (the list endpoint doesn't
 * return those). Rows appear immediately; detail cells fill in as they load.
 */
export function useSiteWorkerRoster(siteId: number) {
  const [rows, setRows] = useState<SiteWorkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchAllSiteWorkers(siteId);
        if (cancelled) return;
        setRows(list.map((w) => ({ ...w, detail: null, detailFailed: false })));
        setLoading(false);

        let next = 0;
        const worker = async () => {
          while (!cancelled) {
            const i = next++;
            if (i >= list.length) return;
            const id = list[i].id;
            try {
              const detail = await fetchSiteWorkerDetail(id);
              if (cancelled) return;
              setRows((prev) => prev.map((r) => (r.id === id ? { ...r, detail } : r)));
            } catch {
              if (cancelled) return;
              setRows((prev) => prev.map((r) => (r.id === id ? { ...r, detailFailed: true } : r)));
            }
          }
        };
        await Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load workers.');
        setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [siteId]);

  return { rows, loading, error };
}
