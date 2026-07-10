import api from '@/lib/api';
import { CompanyInvoice, RawCompanyInvoice, normaliseCompanyInvoice } from '@/types/company_invoices';
import { RawPaginatedResponse } from '@/types/invoice';

export interface CompanyInvoiceFilters {
  startDate?: string;
  endDate?: string;
}

export async function fetchCompanyInvoices(
  filters: CompanyInvoiceFilters = {}
): Promise<RawCompanyInvoice[]> {
  const params: Record<string, string> = {};
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate)   params.end_date   = filters.endDate;

  const { data } = await api.get('/company-invoices/all', { params });
  const res = data as RawPaginatedResponse<RawCompanyInvoice>;
  return res?.data?.items ?? [];
}

export async function fetchCompanyInvoiceDetail(id: string): Promise<CompanyInvoice> {
  const { data } = await api.get(`/company-invoices/details/${id}`);
  return normaliseCompanyInvoice((data?.data ?? data) as RawCompanyInvoice);
}

export interface CreateCompanyInvoiceItemPayload {
  particulars: string;
  quantity: number;
  unit_price: number;
}

export interface CreateCompanyInvoicePayload {
  invoice_number: string;
  invoice_date: string;
  notes: string | null;
  items: CreateCompanyInvoiceItemPayload[];
}

export async function createCompanyInvoice(payload: CreateCompanyInvoicePayload): Promise<void> {
  await api.post('/company-invoices/create', payload);
}