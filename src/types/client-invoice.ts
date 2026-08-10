import { InvoicePaymentStatus, PaymentHistory } from '@/types/company_invoices';

export interface ClientInvoiceListItem {
  id: number;
  invoiceNo: string;
  clientName: string;
  invoiceDate: string;
  total: number;
  createdAt: string;
  site_id?: number;
  paymentStatus?: InvoicePaymentStatus;
}

export interface ClientInvoiceListItemDTO {
  id: number;
  invoiceNo?: string;
  clientName?: string;
  invoiceDate?: string;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  site_id?: number;
  paymentStatus?: InvoicePaymentStatus;
}

export interface ClientInvoiceItemDraft {
  particulars: string;
  quantity: string;
  unit_price: string;
}

export interface NewClientInvoiceForm {
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  site_id: string;
  notes: string;
}

export interface ClientInvoiceDetailItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface ClientInvoiceDetail {
  id: number;
  invoiceNo: string;
  clientName: string;
  invoiceDate: string;
  notes?: string;
  createdBy: { id: number; name: string };
  total: number;
  created_at: string;
  items: ClientInvoiceDetailItem[];
  paymentStatus: InvoicePaymentStatus;
  totalPaid?: number | null;
  remainingBalance?: number | null;
}

export interface ClientInvoiceDetailItemDTO {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface ClientInvoiceDetailDTO {
  id: number;
  invoiceNo?: string;
  clientName?: string;
  invoiceDate?: string;
  notes?: string;
  createdBy?: { id: number; name: string };
  total?: number;
  created_at?: string;
  items?: ClientInvoiceDetailItemDTO[];
  paymentStatus?: InvoicePaymentStatus;
  totalPaid?: number | null;
  remainingBalance?: number | null;
}

export interface ClientInvoiceItem {
  id: number;
  item_index: number;
  particulars: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ClientInvoice {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  clientName: string;
  total: number;
  notes?: string;
  site_id?: number;
  created_by?: number;
  createdAt?: string;
  updatedAt?: string;
  items: ClientInvoiceItem[];
}

export interface InvoicePreview {
  invoiceNo?: string;
  clientName?: string;
}

export type DateFilterMode = 'single' | 'range';

export { InvoicePaymentStatus };
export type { PaymentHistory };