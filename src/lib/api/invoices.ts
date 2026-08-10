import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { InvoiceSummaryItem } from '@/types/invoice-summary';
import { unwrapArray } from '@/lib/api-response';

export async function fetchInvoiceSummary(): Promise<InvoiceSummaryItem[]> {
  const { data } = await api.get(API.invoices.summary);
  return unwrapArray<InvoiceSummaryItem>(data);
}