import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { InvoiceSummaryItem } from '@/types/invoice-summary';

function unwrapArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];
    }
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

export async function fetchInvoiceSummary(): Promise<InvoiceSummaryItem[]> {
  const { data } = await api.get(API.invoices.summary);
  return unwrapArray<InvoiceSummaryItem>(data);
}