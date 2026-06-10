import { RawCreatedBy } from '@/types/invoice';

export interface RawCompanyInvoiceItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface RawCompanyInvoice {
  id: number;
  invoiceNo: string;
  invoicedBy: RawCreatedBy | string | null;
  source?: string;
  requester?: string;
  invoiceDate: string;
  notes?: string | null;
  total: number;
  created_at?: string;
  updatedAt?: string;
  items?: RawCompanyInvoiceItem[];
}

export interface CompanyInvoiceItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface CompanyInvoice {
  id: number;
  invoice_number: string;
  invoiced_by: string | null;
  source: string | null;
  requester: string | null;
  invoice_date: string | null;
  notes: string | null;
  total: number;
  created_at: string | null;
  updated_at: string | null;
  items: CompanyInvoiceItem[];
}

export function normaliseCompanyInvoice(raw: RawCompanyInvoice): CompanyInvoice {
  const invoicedBy =
    typeof raw.invoicedBy === 'string'
      ? raw.invoicedBy
      : (raw.invoicedBy as RawCreatedBy)?.name ?? null;

  return {
    id:             raw.id,
    invoice_number: raw.invoiceNo,
    invoiced_by:    invoicedBy,
    source:         raw.source    ?? null,
    requester:      raw.requester ?? null,
    invoice_date:   raw.invoiceDate  ?? null,
    notes:          raw.notes        ?? null,
    total:          raw.total,
    created_at:     raw.created_at   ?? null,
    updated_at:     raw.updatedAt    ?? null,
    items: (raw.items ?? []).map((item) => ({
      id:           item.id,
      index:        item.index,
      particulars:  item.particulars,
      quantity:     item.quantity,
      unit_price:   item.unitPrice,
      total_amount: item.totalAmount,
    })),
  };
}