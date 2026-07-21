import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { Invoice, RawInvoice, RawPaginatedResponse, normaliseInvoice } from '@/types/invoice';

export interface Site {
  id: number;
  name: string;
  location: string;
}

export interface SupplierInvoiceFilters {
  siteId?: string;
  startDate?: string;
  endDate?: string;
}

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get('/sites/list');
  return data?.data?.items ?? data?.data ?? [];
}

export async function fetchSupplierInvoices(
  filters: SupplierInvoiceFilters = {}
): Promise<RawInvoice[]> {
  const params: Record<string, string> = {};
  if (filters.siteId)    params.site_id    = filters.siteId;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate)   params.end_date   = filters.endDate;

  const { data } = await api.get(API.invoices.all, { params });
  const res = data as RawPaginatedResponse<RawInvoice>;
  return res?.data?.items ?? [];
}

export async function fetchSupplierInvoiceDetail(id: string): Promise<Invoice> {
  const { data } = await api.get(API.invoices.detail(Number(id)));
  return normaliseInvoice(data?.data ?? data);
}