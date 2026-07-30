'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteStore } from '@/store/site-store';
import type { Site } from '@/types/site';

export function useQualitySites() {
  const router = useRouter();

  const sites = useSiteStore((s) => s.sites);
  const loading = useSiteStore((s) => s.isLoading);
  const storeError = useSiteStore((s) => s.error);
  const isOffline = useSiteStore((s) => s.isOffline);
  const fetchSitesAction = useSiteStore((s) => s.fetchSites);

  const [retryInfo, setRetryInfo] = useState<{ attempt: number; max: number } | null>(null);
  const loadSites = useCallback(async () => {
    setRetryInfo(null);
    await fetchSitesAction(true, (attempt, max) => setRetryInfo({ attempt, max }));
    setRetryInfo(null);
  }, [fetchSitesAction]);

  useEffect(() => {
    fetchSitesAction(false, (attempt, max) => setRetryInfo({ attempt, max }));
  }, [fetchSitesAction]);

  const openSite = useCallback(
    (site: Site) => router.push(`/quality/dashboard/${site.id}`),
    [router]
  );

  return {
    sites,
    loading,
    error: isOffline ? null : storeError,
    offline: isOffline,
    retryInfo,
    loadSites,
    openSite,
  };
}