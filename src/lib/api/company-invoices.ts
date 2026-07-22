import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import {
  CompanyInvoice,
  RawCompanyInvoice,
  normaliseCompanyInvoice,
  InvoicePaymentStatus,
  PaymentHistory,
} from '@/types/company_invoices';
import { RawPaginatedResponse } from '@/types/invoice';

export interface CompanyInvoiceFilters {
  startDate?: string;
  endDate?: string;
  status?: InvoicePaymentStatus;
}

export async function fetchCompanyInvoices(
  filters: CompanyInvoiceFilters = {}
): Promise<RawCompanyInvoice[]> {
  const params: Record<string, string> = {};
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate)   params.end_date   = filters.endDate;
  if (filters.status)    params.payment_status = filters.status;
  
  const { data } = await api.get(API.companyInvoices.all, { params });
  const res = data as RawPaginatedResponse<RawCompanyInvoice>;
  return res?.data?.items ?? [];
}

export async function fetchCompanyInvoiceDetail(id: string): Promise<CompanyInvoice> {
  const { data } = await api.get(API.companyInvoices.detail(id));
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
  await api.post(API.companyInvoices.create, payload);
}

export interface UpdateInvoiceStatusResponse {
  id: number;
  invoice_number: string;
  payment_status: InvoicePaymentStatus;
}

export async function updateCompanyInvoiceStatus(
  id: number | string,
  status: InvoicePaymentStatus
): Promise<UpdateInvoiceStatusResponse> {
  const { data } = await api.patch(API.invoiceActions.updateStatus('company', id), { status });
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

export async function recordCompanyInvoicePayment(
  id: number | string,
  payload: RecordPaymentPayload
): Promise<RecordPaymentResponse> {
  const { data } = await api.post(API.invoiceActions.recordPayment('company', id), payload);
  return (data?.data ?? data) as RecordPaymentResponse;
}

export async function fetchCompanyInvoicePaymentHistory(
  id: number | string
): Promise<PaymentHistory> {
  const { data } = await api.get(API.invoiceActions.paymentHistory('company', id));
  return (data?.data ?? data) as PaymentHistory;
}