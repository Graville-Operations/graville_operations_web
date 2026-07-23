import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import type {
  SubcontractorInvoiceListItem,
  SubcontractorInvoiceDetail,
  NewSubcontractorInvoicePayload,
  PaymentHistorySummary,
} from '@/types/subcontractor-invoice';

interface FetchInvoicesParams {
  siteId?: string;
  paymentStatus?: string;
  skip?: number;
  limit?: number;
}

interface FetchInvoicesResult {
  items: SubcontractorInvoiceListItem[];
  total: number;
}

export async function fetchSubcontractorInvoices(
  { siteId, paymentStatus, skip = 0, limit = 100 }: FetchInvoicesParams = {},
): Promise<FetchInvoicesResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = { skip, limit };
  if (siteId) params.site_id = siteId;
  if (paymentStatus) params.payment_status = paymentStatus;

  const { data } = await api.get(API.subcontractorInvoices.all, { params });
  const items: SubcontractorInvoiceListItem[] = data?.data?.items ?? [];
  const total: number = data?.data?.total ?? items.length;
  return { items, total };
}

export async function fetchSubcontractorInvoiceDetail(
  id: number,
): Promise<SubcontractorInvoiceDetail> {
  const { data } = await api.get(API.subcontractorInvoices.detail(id));
  return data?.data ?? data;
}

export async function createSubcontractorInvoice(
  payload: NewSubcontractorInvoicePayload,
): Promise<void> {
  await api.post(API.subcontractorInvoices.create, payload);
}

// --- Status / payment actions -------------------------------------------

// NOTE: confirm this is the correct key used in INVOICE_MODELS (invoice_registry.py)
const INVOICE_TYPE = 'subcontractor';

export async function updateSubcontractorInvoiceStatus(
  id: number,
  status: 'PENDING' | 'REJECTED',
): Promise<void> {
  await api.patch(API.invoiceActions.updateStatus(INVOICE_TYPE, id), { status });
}

export async function recordSubcontractorInvoicePayment(
  id: number,
  payload: { amount: number; notes?: string },
): Promise<void> {
  await api.post(API.invoiceActions.recordPayment(INVOICE_TYPE, id), payload);
}

// The backend returns:
// {
//   invoice_id, total_invoice_value, total_paid, remaining_balance,
//   payments: [{ id, amount, payment_date, notes, recorded_by }, ...]
// }
// under `data.data` — i.e. the array is nested inside a summary object,
// not returned bare. This maps that shape into the camelCase
// PaymentHistorySummary used by the UI.
export async function fetchSubcontractorInvoicePaymentHistory(
  id: number,
): Promise<PaymentHistorySummary> {
  const { data } = await api.get(API.invoiceActions.paymentHistory(INVOICE_TYPE, id));
  const d = data?.data ?? {};
  const payments = Array.isArray(d.payments) ? d.payments : [];

  return {
    invoiceId: d.invoice_id,
    totalInvoiceValue: d.total_invoice_value,
    totalPaid: d.total_paid,
    remainingBalance: d.remaining_balance,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payments: payments.map((p: any) => ({
      id: p.id,
      amount: p.amount,
      notes: p.notes ?? null,
      paymentDate: p.payment_date,
      recordedBy: p.recorded_by,
    })),
  };
}