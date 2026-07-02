import api from '@/lib/api';
import { Site } from '@/types';
import {
  ClientInvoiceListItem,
  ClientInvoiceDetail,
  NewClientInvoiceForm,
  ClientInvoiceItemDraft,
} from '@/types/client-invoice';

function unwrap<T>(data: unknown): T {
  return ((data as { data?: unknown })?.data ?? data) as T;
}

function unwrapList<T>(data: unknown): T[] {
  const payload = unwrap<T[] | { items?: T[] }>(data);
  if (Array.isArray(payload)) return payload;
  return (payload as { items?: T[] })?.items ?? [];
}

// NOTE: check lib/api/sites.ts first — it likely already exports a sites
// fetcher. If so, delete this and import that instead of duplicating.
export async function fetchSites(limit = 100): Promise<Site[]> {
  const { data } = await api.get(`/sites/list?limit=${limit}`);
  return unwrapList<Site>(data);
}

export async function fetchClientInvoices(siteId?: number): Promise<{ items: ClientInvoiceListItem[]; total: number }> {
  let url = '/client-invoices/all?limit=100';
  if (siteId) url += `&site_id=${siteId}`;
  const { data } = await api.get(url);
  const payload = unwrap<{ items?: ClientInvoiceListItem[]; total?: number } | ClientInvoiceListItem[]>(data);
  const items = Array.isArray(payload) ? payload : payload?.items ?? [];
  const total = Array.isArray(payload) ? items.length : payload?.total ?? items.length;
  return { items, total };
}

export async function fetchClientInvoiceDetail(id: string | number): Promise<ClientInvoiceDetail> {
  const { data } = await api.get(`/client-invoices/details/${id}`);
  return (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) ? data.data : data;
}

export async function createClientInvoice(
  form: NewClientInvoiceForm,
  items: ClientInvoiceItemDraft[]
): Promise<void> {
  await api.post('/client-invoices/create', {
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