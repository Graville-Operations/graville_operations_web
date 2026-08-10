import { InvoicePaymentStatus } from '@/types/enums/invoice-payment-status';

export { InvoicePaymentStatus };

export interface LineItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface BriefUserInfo {
  name: string;
  email: string;
  phone: string;
}

export interface SubcontractorInvoiceListItem {
  id: number;
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;
  total: number;
  createdAt: string;
  createdBy?: BriefUserInfo;
  paymentStatus?: InvoicePaymentStatus;
}

export interface SubcontractorInvoiceListItemDTO {
  id: number;
  invoiceNo?: string;
  contractorName?: string;
  invoiceDate?: string;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: BriefUserInfo;
  paymentStatus?: InvoicePaymentStatus;
}

export interface SubcontractorInvoiceDetail {
  id: number;
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;
  notes: string | null;
  createdBy: BriefUserInfo;
  total: number;
  created_at: string;
  items: LineItem[];
  paymentStatus?: InvoicePaymentStatus;
}

export interface SubcontractorInvoiceDetailDTO {
  id: number;
  invoiceNo?: string;
  contractorName?: string;
  invoiceDate?: string;
  notes?: string | null;
  createdBy?: BriefUserInfo;
  total?: number;
  created_at?: string;
  items?: LineItem[];
  paymentStatus?: InvoicePaymentStatus;
}

export interface SiteOption {
  id: number;
  name: string;
}

export interface NewLineItem {
  particulars: string;
  quantity: string;
  unitPrice: string;
}

export interface NewInvoiceForm {
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;
  notes: string;
  items: NewLineItem[];
}

export interface NewSubcontractorInvoicePayload {
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;
  notes: string | null;
  items: {
    index: number;
    particulars: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
}

export const emptyLineItem = (): NewLineItem => ({
  particulars: '',
  quantity: '',
  unitPrice: '',
});

export const defaultInvoiceForm = (): NewInvoiceForm => ({
  invoiceNo: '',
  contractorName: '',
  invoiceDate: '',
  notes: '',
  items: [emptyLineItem()],
});

export interface PaymentHistoryEntry {
  id: number;
  amount: number;
  notes: string | null;
  paymentDate: string;
  recordedBy: string | null;
}

export interface PaymentHistorySummary {
  invoiceId: number;
  totalInvoiceValue: number;
  totalPaid: number;
  remainingBalance: number;
  payments: PaymentHistoryEntry[];
}