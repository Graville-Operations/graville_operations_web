'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllSiteWorkers, fetchSiteWorkerDetail } from '@/lib/api/site-workers';
import type { SiteWorkerRow } from '@/types/site-worker-detail';

const CONCURRENCY = 6;

/**
 * Loads every worker on a site once (one row per worker, no repeats), then
 * fills in phone / national id / check-in count from /workers/details/{id}.
 * Rows appear immediately; detail cells fill in as they load.
 * `loadDetail(id)` retries a single worker (used when a row is opened).
 */
export function useSiteWorkerRoster(siteId: number) {
  const [rows, setRows] = useState<SiteWorkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const loadDetail = useCallback(async (id: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, detailFailed: false } : r)));
    try {
      const detail = await fetchSiteWorkerDetail(id);
      if (!alive.current) return;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, detail, detailFailed: false } : r)));
    } catch {
      if (!alive.current) return;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, detailFailed: true } : r)));
    }
  }, []);

  useEffect(() => {
    alive.current = true;
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
            await loadDetail(list[i].id);
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
    return () => {
      cancelled = true;
      alive.current = false;
    };
  }, [siteId, loadDetail]);

  return { rows, loading, error, loadDetail };
}
