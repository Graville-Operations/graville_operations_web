import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import type { InvoicePaymentStatus } from '@/types/subcontractor-invoice';

export async function updateInvoiceStatus(
  invoiceType: string,
  invoiceId: number,
  status: InvoicePaymentStatus,
): Promise<void> {
  await api.patch(API.invoiceActions.updateStatus(invoiceType, invoiceId), { status });
}