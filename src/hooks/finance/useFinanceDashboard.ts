import { useCallback, useEffect, useState } from 'react';
import { ROUTES } from '@/lib/routes';
import { fetchSites, fetchSiteInvoiceStats, SiteInvoiceStats } from '@/lib/api/finance-dashboard';
import { DashboardSite, SiteStat, InvoiceTypeStat } from '@/types/finance-dashboard';

function buildRows(stats: SiteInvoiceStats, siteId: number): InvoiceTypeStat[] {
  return [
    { key: 'client',        label: 'Client Invoice',         count: stats.client.count,        amount: stats.client.amount,        route: `${ROUTES.finance.invoice.client.list}?site_id=${siteId}` },
    { key: 'supplier',      label: 'Supplier Invoice',       count: stats.supplier.count,      amount: stats.supplier.amount,      route: `${ROUTES.finance.invoice.supplier.list}?site_id=${siteId}` },
    { key: 'subcontractor', label: 'Sub-Contractor Invoice', count: stats.subcontractor.count, amount: stats.subcontractor.amount, route: `${ROUTES.finance.invoice.contractor}?site_id=${siteId}` },
  ];
}

export function useFinanceDashboard() {
  const [siteStats,    setSiteStats]    = useState<SiteStat[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError,   setSitesError]   = useState(false);
  const [siteSearch,   setSiteSearch]   = useState('');

  const loadSiteStats = useCallback(async (siteList?: DashboardSite[]) => {
    let sites: DashboardSite[] = siteList ?? [];
    if (!siteList) {
      try {
        sites = await fetchSites();
        setSitesError(false);
      } catch {
        setSitesError(true);
        setSitesLoading(false);
        return;
      }
    }
    setSitesLoading(false);

    setSiteStats(
      sites.map((site) => ({ site, rows: [], companyStat: null, loading: true, error: false })),
    );

    sites.forEach(async (site) => {
      try {
        const stats = await fetchSiteInvoiceStats(site.id);
        const rows  = buildRows(stats, site.id);

        setSiteStats((prev) =>
          prev.map((s) =>
            s.site.id === site.id ? { ...s, rows, companyStat: stats.company, loading: false, error: false } : s,
          ),
        );
      } catch {
        setSiteStats((prev) =>
          prev.map((s) => (s.site.id === site.id ? { ...s, loading: false, error: true } : s)),
        );
      }
    });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSiteStats(); }, [loadSiteStats]);

  const retryAll = useCallback(() => {
    setSitesLoading(true);
    setSitesError(false);
    setSiteStats([]);
    loadSiteStats();
  }, [loadSiteStats]);

  const retrySite = useCallback((site: DashboardSite) => {
    setSiteStats((prev) =>
      prev.map((s) => (s.site.id === site.id ? { ...s, loading: true, error: false } : s)),
    );
    (async () => {
      try {
        const stats = await fetchSiteInvoiceStats(site.id);
        const rows  = buildRows(stats, site.id);
        setSiteStats((prev) =>
          prev.map((s) => (s.site.id === site.id ? { ...s, rows, companyStat: stats.company, loading: false, error: false } : s)),
        );
      } catch {
        setSiteStats((prev) =>
          prev.map((s) => (s.site.id === site.id ? { ...s, loading: false, error: true } : s)),
        );
      }
    })();
  }, []);

  const filteredStats = siteSearch.trim()
    ? siteStats.filter((s) => s.site.name.toLowerCase().includes(siteSearch.trim().toLowerCase()))
    : siteStats;

  const companyLoading     = sitesLoading || (siteStats.length > 0 && siteStats.some((s) => s.loading));
  const companyHasError    = !sitesLoading && siteStats.some((s) => s.error);
  const companyTotalAmount = siteStats.reduce((sum, s) => sum + (s.companyStat?.amount ?? 0), 0);
  const companyTotalCount  = siteStats.reduce((sum, s) => sum + (s.companyStat?.count ?? 0), 0);

  return {
    siteStats,
    sitesLoading,
    sitesError,
    siteSearch,
    setSiteSearch,
    filteredStats,
    retryAll,
    retrySite,
    companyLoading,
    companyHasError,
    companyTotalAmount,
    companyTotalCount,
  };
}