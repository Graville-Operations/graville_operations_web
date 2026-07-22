import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import {
  Invoice,
  RawInvoice,
  RawPaginatedResponse,
  normaliseInvoice,
  InvoicePaymentStatus,
  PaymentHistory,
} from '@/types/invoice';

export interface Site {
  id: number;
  name: string;
  location: string;
}

export interface SupplierInvoiceFilters {
  siteId?: string;
  startDate?: string;
  endDate?: string;
  status?: InvoicePaymentStatus;
}

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get(API.sites.list);
  return data?.data?.items ?? data?.data ?? [];
}

export async function fetchSupplierInvoices(
  filters: SupplierInvoiceFilters = {}
): Promise<RawInvoice[]> {
  const params: Record<string, string> = {};
  if (filters.siteId)    params.site_id       = filters.siteId;
  if (filters.startDate) params.start_date    = filters.startDate;
  if (filters.endDate)   params.end_date      = filters.endDate;
  if (filters.status)    params.payment_status = filters.status;

  const { data } = await api.get(API.invoices.all, { params });
  const res = data as RawPaginatedResponse<RawInvoice>;
  return res?.data?.items ?? [];
}

export async function fetchSupplierInvoiceDetail(id: string): Promise<Invoice> {
  const { data } = await api.get(API.invoices.detail(Number(id)));
  return normaliseInvoice(data?.data ?? data);
}

export interface UpdateInvoiceStatusResponse {
  id: number;
  invoice_number: string;
  payment_status: InvoicePaymentStatus;
}

export async function updateSupplierInvoiceStatus(
  id: number | string,
  status: InvoicePaymentStatus
): Promise<UpdateInvoiceStatusResponse> {
  const { data } = await api.patch(API.invoiceActions.updateStatus('supplier', id), { status });
  return (data?.data ?? data) as UpdateInvoiceStatusResponse;
}

export interface RecordPaymentPayload {
  amount: number;
  notes?: string;
}

export interface RecordPaymentResponse {
  invoice_id: number;
  invoice_number: string;
  payment_amount: number;
  total_paid: number;
  remaining_balance: number;
  payment_status: InvoicePaymentStatus;
}

export async function recordSupplierInvoicePayment(
  id: number | string,
  payload: RecordPaymentPayload
): Promise<RecordPaymentResponse> {
  const { data } = await api.post(API.invoiceActions.recordPayment('supplier', id), payload);
  return (data?.data ?? data) as RecordPaymentResponse;
}

export async function fetchSupplierInvoicePaymentHistory(
  id: number | string
): Promise<PaymentHistory> {
  const { data } = await api.get(API.invoiceActions.paymentHistory('supplier', id));
  return (data?.data ?? data) as PaymentHistory;
}