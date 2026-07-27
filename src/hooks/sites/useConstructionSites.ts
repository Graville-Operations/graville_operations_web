'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSites, fetchOverviewKPIs } from '@/lib/api/sites';
import { Site, ProjectStatus, OverviewKPIs } from '@/types/site';
import { normProjectStatus } from '@/lib/utils/site-helpers';

export function useConstructionSites() {
  const [sites, setSites]             = useState<Site[]>([]);
  const [kpis, setKpis]               = useState<OverviewKPIs | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingKpis, setLoadingKpis]   = useState(true);
  const [sitesError, setSitesError]     = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const load = useCallback(() => {
    setLoadingSites(true);
    setSitesError(null);
    fetchSites()
      .then((data) => setSites(data))
      .catch((err: unknown) =>
        setSitesError(err instanceof Error ? err.message : 'Failed to load sites'))
      .finally(() => setLoadingSites(false));

    setLoadingKpis(true);
    fetchOverviewKPIs()
      .then((res) => {
        const d = (res as { data?: OverviewKPIs }).data ?? (res as OverviewKPIs);
        setKpis(d);
      })
      .catch(() => {})
      .finally(() => setLoadingKpis(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalSites    = kpis?.totalSites    ?? 0;
  const planningSites = kpis?.planningSites ?? 0;
  const activeSites   = kpis?.activeSites   ?? 0;
  const pausedSites = sites.filter(
    (s) => normProjectStatus(s.project_status as unknown as string) === 'ON_HOLD',
  ).length;
  const doneSites = sites.filter(
    (s) => normProjectStatus(s.project_status as unknown as string) === 'COMPLETED',
  ).length;

  const filtered = sites.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search || s.name.toLowerCase().includes(q) || (s.location ?? '').toLowerCase().includes(q);
    const matchProj =
      projectFilter === 'ALL' || normProjectStatus(s.project_status as unknown as string) === projectFilter;
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