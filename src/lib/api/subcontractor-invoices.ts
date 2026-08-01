import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapObject } from '@/lib/api-response';
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
  const inner = unwrapObject<{ items?: SubcontractorInvoiceListItem[]; total?: number }>(data);
  const items = inner?.items ?? [];
  const total = inner?.total ?? items.length;
  return { items, total };
}

export async function fetchSubcontractorInvoiceDetail(
  id: number,
): Promise<SubcontractorInvoiceDetail> {
  const { data } = await api.get(API.subcontractorInvoices.detail(id));
  return unwrapObject<SubcontractorInvoiceDetail>(data);
}

export async function createSubcontractorInvoice(
  payload: NewSubcontractorInvoicePayload,
): Promise<void> {
  await api.post(API.subcontractorInvoices.create, payload);
}

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
export async function fetchSubcontractorInvoicePaymentHistory(
  id: number,
): Promise<PaymentHistorySummary> {
  const { data } = await api.get(API.invoiceActions.paymentHistory(INVOICE_TYPE, id));
  const d = unwrapObject<Record<string, any>>(data) ?? {};
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