'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchOverviewKPIs } from '@/lib/api/sites';
import { ProjectStatus, OverviewKPIs } from '@/types/site';
import { normProjectStatus } from '@/lib/utils/site-helpers';
import { useSiteStore } from '@/store/site-store';

export function useConstructionSites() {
  const sites = useSiteStore((s) => s.sites);
  const loadingSites = useSiteStore((s) => s.isLoading);
  const sitesError = useSiteStore((s) => s.error);
  const fetchSitesAction = useSiteStore((s) => s.fetchSites);

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const loadKpis = useCallback(() => {
    setLoadingKpis(true);
    fetchOverviewKPIs()
      .then((res) => {
        const d = (res as { data?: OverviewKPIs }).data ?? (res as OverviewKPIs);
        setKpis(d);
      })
      .catch(() => {})
      .finally(() => setLoadingKpis(false));
  }, []);

  const load = useCallback(() => {
    fetchSitesAction(true); 
    loadKpis();
  }, [fetchSitesAction, loadKpis]);

  useEffect(() => {
    fetchSitesAction(); 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKpis();
  }, [fetchSitesAction, loadKpis]);

  const totalSites    = kpis?.totalSites    ?? 0;
  const planningSites = kpis?.planningSites ?? 0;
  const activeSites   = kpis?.activeSites   ?? 0;
  const pausedSites = sites.filter(
    (s) => normProjectStatus((s as unknown as { projectStatus?: string }).projectStatus ?? '') === 'ON_HOLD',
  ).length;
  const doneSites = sites.filter(
    (s) => normProjectStatus((s as unknown as { projectStatus?: string }).projectStatus ?? '') === 'COMPLETED',
  ).length;

  const filtered = sites.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search || s.name.toLowerCase().includes(q) || (s.location ?? '').toLowerCase().includes(q);
    const matchProj =
      projectFilter === 'ALL' ||
      normProjectStatus((s as unknown as { projectStatus?: string }).projectStatus ?? '') === projectFilter;
    return matchSearch && matchProj;
  });

  return {
    sites,
    filtered,
    kpis,
    loadingSites,
    loadingKpis,
    sitesError,
    search,
    setSearch,
    projectFilter,
    setProjectFilter,
    load,
    stats: { totalSites, planningSites, activeSites, pausedSites, doneSites },
  };
}