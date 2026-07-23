import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { Site } from '@/types';
import {
  ClientInvoiceListItem,
  ClientInvoiceDetail,
  NewClientInvoiceForm,
  ClientInvoiceItemDraft,
  InvoicePaymentStatus,
  PaymentHistory,
} from '@/types/client-invoice';

function unwrap<T>(data: unknown): T {
  return ((data as { data?: unknown })?.data ?? data) as T;
}

function unwrapList<T>(data: unknown): T[] {
  const payload = unwrap<T[] | { items?: T[] }>(data);
  if (Array.isArray(payload)) return payload;
  return (payload as { items?: T[] })?.items ?? [];
}

// NOTE: duplicates fetchSites in lib/api/sites.ts — consider importing
// that one instead of keeping a separate copy here.
export async function fetchSites(limit = 100): Promise<Site[]> {
  const { data } = await api.get(API.sites.list, { params: { limit } });
  return unwrapList<Site>(data);
}

export async function fetchClientInvoices(
  siteId?: number,
  status?: InvoicePaymentStatus
): Promise<{ items: ClientInvoiceListItem[]; total: number }> {
  const params: Record<string, any> = { limit: 100 };
  if (siteId) params.site_id = siteId;
  if (status) params.payment_status = status;
  const { data } = await api.get(API.clientInvoices.all, { params });
  const payload = unwrap<{ items?: ClientInvoiceListItem[]; total?: number } | ClientInvoiceListItem[]>(data);
  const items = Array.isArray(payload) ? payload : payload?.items ?? [];
  const total = Array.isArray(payload) ? items.length : payload?.total ?? items.length;
  return { items, total };
}

export async function fetchClientInvoiceDetail(id: string | number): Promise<ClientInvoiceDetail> {
  const { data } = await api.get(API.clientInvoices.detail(id));
  return (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) ? data.data : data;
}

export async function createClientInvoice(
  form: NewClientInvoiceForm,
  items: ClientInvoiceItemDraft[]
): Promise<void> {
  await api.post(API.clientInvoices.create, {
    invoice_number: form.invoice_number,
    invoice_date: form.invoice_date,
    client_name: form.client_name,
    site_id: Number(form.site_id),
    notes: form.notes || null,
    items: items.map((item) => ({
      particulars: item.particulars,
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
    })),
  });
}

export interface UpdateInvoiceStatusResponse {
  id: number;
  invoice_number: string;
  payment_status: InvoicePaymentStatus;
}

export async function updateClientInvoiceStatus(
  id: number | string,
  status: InvoicePaymentStatus
): Promise<UpdateInvoiceStatusResponse> {
  const { data } = await api.patch(API.invoiceActions.updateStatus('client', id), { status });
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

export async function recordClientInvoicePayment(
  id: number | string,
  payload: RecordPaymentPayload
): Promise<RecordPaymentResponse> {
  const { data } = await api.post(API.invoiceActions.recordPayment('client', id), payload);
  return (data?.data ?? data) as RecordPaymentResponse;
}

export async function fetchClientInvoicePaymentHistory(
  id: number | string
): Promise<PaymentHistory> {
  const { data } = await api.get(API.invoiceActions.paymentHistory('client', id));
  return (data?.data ?? data) as PaymentHistory;
}