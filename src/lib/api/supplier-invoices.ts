import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import { normaliseSupplierInvoice, normalisePaymentHistory } from '@/lib/mappers/invoice-mappers';
import {
  Invoice,
  SupplierInvoiceDTO,
  InvoicePaymentStatus,
  PaymentHistory,
} from '@/types/invoice';
import type { PaymentHistoryDTO } from '@/types/company_invoices';

export interface SupplierInvoiceFilters {
  siteId?: string;
  startDate?: string;
  endDate?: string;
  status?: InvoicePaymentStatus;
}

export async function fetchSupplierInvoices(
  filters: SupplierInvoiceFilters = {}
): Promise<SupplierInvoiceDTO[]> {
  const params: Record<string, string> = {};
  if (filters.siteId)    params.site_id       = filters.siteId;
  if (filters.startDate) params.start_date    = filters.startDate;
  if (filters.endDate)   params.end_date      = filters.endDate;
  if (filters.status)    params.payment_status = filters.status;

  const { data } = await api.get(API.invoices.all, { params });
  return unwrapArray<SupplierInvoiceDTO>(data);
}

export async function fetchSupplierInvoiceDetail(id: string): Promise<Invoice> {
  const { data } = await api.get(API.invoices.detail(Number(id)));
  return normaliseSupplierInvoice(unwrapObject<SupplierInvoiceDTO>(data));
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

export async function recordSupplierInvoicePayment(
  id: number | string,
  payload: RecordPaymentPayload
): Promise<RecordPaymentResponse> {
  const { data } = await api.post(API.invoiceActions.recordPayment('supplier', id), payload);
  return unwrapObject<RecordPaymentResponse>(data);
}

export async function fetchSupplierInvoicePaymentHistory(
  id: number | string
): Promise<PaymentHistory> {
  const { data } = await api.get(API.invoiceActions.paymentHistory('supplier', id));
  return normalisePaymentHistory(unwrapObject<PaymentHistoryDTO>(data));
}