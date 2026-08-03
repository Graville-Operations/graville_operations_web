import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { RawPaginatedResponse } from '@/types/invoice';
import { DashboardSite, InvoiceStatRow, InvoiceStat } from '@/types/finance-dashboard';

export async function fetchSites(): Promise<DashboardSite[]> {
  const res = await api.get<RawPaginatedResponse<DashboardSite>>(`${API.sites.list}?limit=100`);
  return res.data?.data?.items ?? [];
}

export async function fetchInvoiceStat(endpoint: string, siteId: number): Promise<InvoiceStat> {
  const res = await api.get<RawPaginatedResponse<InvoiceStatRow>>(
    `${endpoint}?site_id=${siteId}&limit=100`,
  );
  const data   = res.data?.data;
  const count  = data?.total ?? 0;
  const amount = (data?.items ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0);
  return { count, amount };
}

export interface SiteInvoiceStats {
  client:        InvoiceStat;
  supplier:      InvoiceStat;
  subcontractor: InvoiceStat;
  company:       InvoiceStat;
}

export async function fetchSiteInvoiceStats(siteId: number): Promise<SiteInvoiceStats> {
  const [client, supplier, subcontractor, company] = await Promise.all([
    fetchInvoiceStat(API.clientInvoices.all,       siteId),
    fetchInvoiceStat(API.invoices.all,              siteId),
    fetchInvoiceStat(API.subcontractorInvoices.all, siteId),
    fetchInvoiceStat(API.companyInvoices.all,       siteId),
  ]);
  return { client, supplier, subcontractor, company };
}