'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { setSites, getAllSites, sitesLoaded, type Site } from '@/lib/sites-cache';
import { fetchQualitySites } from '@/lib/api/quality';

export function useQualitySites() {
  const router = useRouter();

  const [sites, setSitesState]   = useState<Site[]>(() => (sitesLoaded() ? getAllSites() : []));
  const [loading, setLoading]     = useState(() => !sitesLoaded());
  const [error, setError]         = useState<string | null>(null);
  const [offline, setOffline]     = useState(false);
  const [retryInfo, setRetryInfo] = useState<{ attempt: number; max: number } | null>(null);

  const loadSites = useCallback(async () => {
    setError(null);
    setRetryInfo(null);

    try {
      const list = await fetchQualitySites((attempt, max) => setRetryInfo({ attempt, max }));
      setSites(list);
      setSitesState(list);
      setOffline(false);
    } catch {
      const cached = sitesLoaded() ? getAllSites() : [];
      if (cached.length > 0) {
        setSitesState(cached);
        setOffline(true);
      } else {
        setError('Failed to load sites.');
      }
    } finally {
      setLoading(false);
      setRetryInfo(null);
    }
  }, []);

  useEffect(() => {
    if (sitesLoaded()) {
      setSitesState(getAllSites());
      setLoading(false);
      return;
    }
    loadSites();
  }, [loadSites]);

  const openSite = useCallback(
    (site: Site) => router.push(`/quality/dashboard/${site.id}`),
    [router]
  );

  return { sites, loading, error, offline, retryInfo, loadSites, openSite };
}