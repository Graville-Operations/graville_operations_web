import { InvoicePaymentStatus } from '@/types/enums/invoice-payment-status';
import { PaymentHistory } from '@/types/company_invoices';

export interface RawInvoiceItem {
  id: number;
  index: number;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalMaterialPrice: number;
}

export interface RawCreatedBy {
  name: string;
  email: string;
  phone: string;
}

export interface RawInvoice {
  id: number;
  invoiceNo: string;
  deliveryNo: string | null;
  lpoNo: string | null;
  supplierName: string;
  invoiceDate: string;
  notes: string | null;
  createdBy: RawCreatedBy | null;
  created_at: string;
  requester: string | null;
  source: string | null;
  updatedAt: string | null;
  total: number;
  amountPaid: number;
  paymentStatus?: InvoicePaymentStatus;
  items: RawInvoiceItem[];
}

export interface RawPaginatedResponse<T> {
  code: number;
  data: {
    items: T[];
    total: number;
    skip: number;
    limit: number;
  };
  message: string;
}

export interface InvoiceItem {
  id: number;
  index: number;
  particular: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  lpo_number: string | null;
  delivery_number: string | null;
  supplier_name: string;
  invoice_date: string;
  total_amount: number;
  total_invoice_value?: number;
  amount_paid: number;
  status: InvoicePaymentStatus;
  total_paid: number | null;
  remaining_balance: number | null;
  site: string | null;
  items: InvoiceItem[];
  submitted_by: string | null;
  submitted_by_id: number;
  notes: string | null;
  created_at: string | null;
}

export { InvoicePaymentStatus };
export type { PaymentHistory };