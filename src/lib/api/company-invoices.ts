import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import { normaliseCompanyInvoice, normalisePaymentHistory } from '@/lib/mappers/invoice-mappers';
import {
  CompanyInvoice,
  CompanyInvoiceDTO,
  InvoicePaymentStatus,
  PaymentHistory,
  PaymentHistoryDTO,
} from '@/types/company_invoices';

export interface CompanyInvoiceFilters {
  startDate?: string;
  endDate?: string;
  status?: InvoicePaymentStatus;
}

export async function fetchCompanyInvoices(
  filters: CompanyInvoiceFilters = {}
): Promise<CompanyInvoiceDTO[]> {
  const params: Record<string, string> = {};
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate)   params.end_date   = filters.endDate;
  if (filters.status)    params.payment_status = filters.status;

  const { data } = await api.get(API.companyInvoices.all, { params });
  return unwrapArray<CompanyInvoiceDTO>(data);
}

export async function fetchCompanyInvoiceDetail(id: string): Promise<CompanyInvoice> {
  const { data } = await api.get(API.companyInvoices.detail(id));
  return normaliseCompanyInvoice(unwrapObject<CompanyInvoiceDTO>(data));
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

export async function recordCompanyInvoicePayment(
  id: number | string,
  payload: RecordPaymentPayload
): Promise<RecordPaymentResponse> {
  const { data } = await api.post(API.invoiceActions.recordPayment('company', id), payload);
  return unwrapObject<RecordPaymentResponse>(data);
}

export async function fetchCompanyInvoicePaymentHistory(
  id: number | string
): Promise<PaymentHistory> {
  const { data } = await api.get(API.invoiceActions.paymentHistory('company', id));
  return normalisePaymentHistory(unwrapObject<PaymentHistoryDTO>(data));
}