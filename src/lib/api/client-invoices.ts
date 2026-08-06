import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import {
  normaliseClientInvoiceListItems,
  normaliseClientInvoiceDetail,
  normalisePaymentHistory,
  type RawClientInvoiceListItem,
  type RawClientInvoiceDetail,
  type RawPaymentHistory,
} from '@/lib/mappers/invoice-mappers';
import {
  ClientInvoiceListItem,
  ClientInvoiceDetail,
  NewClientInvoiceForm,
  ClientInvoiceItemDraft,
  InvoicePaymentStatus,
  PaymentHistory,
} from '@/types/client-invoice';

export async function fetchClientInvoices(
  siteId?: number,
  status?: InvoicePaymentStatus
): Promise<{ items: ClientInvoiceListItem[]; total: number }> {
  const params: Record<string, any> = { limit: 100 };
  if (siteId) params.site_id = siteId;
  if (status) params.payment_status = status;
  const { data } = await api.get(API.clientInvoices.all, { params });
  const items = normaliseClientInvoiceListItems(unwrapArray<RawClientInvoiceListItem>(data));
  const inner = unwrapObject<{ total?: number }>(data);
  const total = inner?.total ?? items.length;
  return { items, total };
}

export async function fetchClientInvoiceDetail(id: string | number): Promise<ClientInvoiceDetail> {
  const { data } = await api.get(API.clientInvoices.detail(id));
  return normaliseClientInvoiceDetail(unwrapObject<RawClientInvoiceDetail>(data));
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
  return unwrapObject<UpdateInvoiceStatusResponse>(data);
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
  return unwrapObject<RecordPaymentResponse>(data);
}

export async function fetchClientInvoicePaymentHistory(
  id: number | string
): Promise<PaymentHistory> {
  const { data } = await api.get(API.invoiceActions.paymentHistory('client', id));
  return normalisePaymentHistory(unwrapObject<RawPaymentHistory>(data));
}