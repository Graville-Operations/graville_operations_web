import type { CreatedByDTO } from '@/types/invoice';
import { InvoicePaymentStatus } from '@/types/enums/invoice-payment-status';

export { InvoicePaymentStatus };

export interface CompanyInvoiceItemDTO {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}
export interface CompanyInvoiceDTO {
  id: number;
  invoiceNo: string;
  invoicedBy: CreatedByDTO | string | null;
  source?: string;
  requester?: string;
  invoiceDate: string;
  notes?: string | null;
  total: number;
  paymentStatus?: InvoicePaymentStatus;
  created_at?: string;
  updatedAt?: string;
  items?: CompanyInvoiceItemDTO[];
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
  payment_status: InvoicePaymentStatus;
  total_paid: number | null;
  remaining_balance: number | null;
  created_at: string | null;
  updated_at: string | null;
  items: CompanyInvoiceItem[];
}

export interface PaymentRecord {
  id: number;
  amount: number;
  payment_date: string;
  notes: string | null;
  recorded_by: string | null;
}

export interface PaymentHistory {
  invoice_id: number;
  total_invoice_value: number;
  total_paid: number;
  remaining_balance: number;
  payments: PaymentRecord[];
}

export interface PaymentRecordDTO {
  id: number;
  amount: number;
  payment_date: string;
  notes?: string | null;
  recorded_by?: string | null;
}

export interface PaymentHistoryDTO {
  invoice_id: number;
  total_invoice_value: number;
  total_paid: number;
  remaining_balance: number;
  payments?: PaymentRecordDTO[];
}