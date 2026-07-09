import api from '@/lib/api';
import type {
  SubcontractorInvoiceListItem,
  SubcontractorInvoiceDetail,
  NewSubcontractorInvoicePayload,
} from '@/types/subcontractor-invoice';

interface FetchInvoicesParams {
  siteId?: string;
  skip?: number;
  limit?: number;
}

interface FetchInvoicesResult {
  items: SubcontractorInvoiceListItem[];
  total: number;
}

export async function fetchSubcontractorInvoices(
  { siteId, skip = 0, limit = 100 }: FetchInvoicesParams = {},
): Promise<FetchInvoicesResult> {
  const params: Record<string, any> = { skip, limit };
  if (siteId) params.site_id = siteId;

  const { data } = await api.get('/subcontractor-invoices/all', { params });
  const items: SubcontractorInvoiceListItem[] = data?.data?.items ?? [];
  const total: number = data?.data?.total ?? items.length;
  return { items, total };
}

export async function fetchSubcontractorInvoiceDetail(
  id: number,
): Promise<SubcontractorInvoiceDetail> {
  const { data } = await api.get(`/subcontractor-invoices/details/${id}`);
  return data?.data ?? data;
}

export async function createSubcontractorInvoice(
  payload: NewSubcontractorInvoicePayload,
): Promise<void> {
  await api.post('/subcontractor-invoices/create', payload);
}