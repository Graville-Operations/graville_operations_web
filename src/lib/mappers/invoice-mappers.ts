import { InvoicePaymentStatus } from '@/types/enums/invoice-payment-status';
import type { RawCreatedBy, RawInvoice, Invoice, InvoiceItem } from '@/types/invoice';
import type {
  RawCompanyInvoice,
  CompanyInvoice,
  CompanyInvoiceItem,
  PaymentHistory,
  PaymentRecord,
} from '@/types/company_invoices';
import type { ClientInvoiceListItem, ClientInvoiceDetail, ClientInvoiceDetailItem } from '@/types/client-invoice';
import type {
  SubcontractorInvoiceListItem,
  SubcontractorInvoiceDetail,
  LineItem,
  BriefUserInfo,
  PaymentHistorySummary,
  PaymentHistoryEntry,
} from '@/types/subcontractor-invoice';

function resolveCreatedByName(createdBy: RawCreatedBy | string | null | undefined): string | null {
  if (!createdBy) return null;
  return typeof createdBy === 'string' ? createdBy : createdBy.name ?? null;
}

export function normaliseSupplierInvoice(raw: RawInvoice): Invoice {
  return {
    id: raw.id,
    invoice_number: raw.invoiceNo,
    lpo_number: raw.lpoNo ?? null,
    delivery_number: raw.deliveryNo ?? null,
    supplier_name: raw.supplierName,
    invoice_date: raw.invoiceDate,
    total_amount: raw.total,
    amount_paid: raw.amountPaid ?? 0,
    status: raw.paymentStatus ?? InvoicePaymentStatus.PENDING,
    total_paid: null,
    remaining_balance: null,
    site: raw.source ?? null,
    submitted_by: raw.requester ?? resolveCreatedByName(raw.createdBy),
    submitted_by_id: 0,
    notes: raw.notes ?? null,
    created_at: raw.created_at ?? raw.updatedAt ?? null,
    items: (raw.items ?? []).map(
      (item): InvoiceItem => ({
        id: item.id,
        index: item.index,
        particular: item.materialName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalMaterialPrice,
      }),
    ),
  };
}


export function normaliseCompanyInvoice(raw: RawCompanyInvoice): CompanyInvoice {
  return {
    id: raw.id,
    invoice_number: raw.invoiceNo,
    invoiced_by: resolveCreatedByName(raw.invoicedBy),
    source: raw.source ?? null,
    requester: raw.requester ?? null,
    invoice_date: raw.invoiceDate ?? null,
    notes: raw.notes ?? null,
    total: raw.total,
    payment_status: raw.paymentStatus ?? InvoicePaymentStatus.PENDING,
    total_paid: null,
    remaining_balance: null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updatedAt ?? null,
    items: (raw.items ?? []).map(
      (item): CompanyInvoiceItem => ({
        id: item.id,
        index: item.index,
        particulars: item.particulars,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_amount: item.totalAmount,
      }),
    ),
  };
}

export interface RawClientInvoiceListItem {
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

export function normaliseClientInvoiceListItem(raw: RawClientInvoiceListItem): ClientInvoiceListItem {
  return {
    id: raw.id,
    invoiceNo: raw.invoiceNo ?? '',
    clientName: raw.clientName ?? '',
    invoiceDate: raw.invoiceDate ?? '',
    total: raw.total ?? 0,
    createdAt: raw.createdAt ?? raw.updatedAt ?? '',
    site_id: raw.site_id,
    paymentStatus: raw.paymentStatus,
  };
}

export function normaliseClientInvoiceListItems(raw: RawClientInvoiceListItem[]): ClientInvoiceListItem[] {
  return raw.map(normaliseClientInvoiceListItem);
}

export interface RawClientInvoiceDetailItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface RawClientInvoiceDetail {
  id: number;
  invoiceNo?: string;
  clientName?: string;
  invoiceDate?: string;
  notes?: string;
  createdBy?: { id: number; name: string };
  total?: number;
  created_at?: string;
  items?: RawClientInvoiceDetailItem[];
  paymentStatus?: InvoicePaymentStatus;
  totalPaid?: number | null;
  remainingBalance?: number | null;
}

export function normaliseClientInvoiceDetail(raw: RawClientInvoiceDetail): ClientInvoiceDetail {
  return {
    id: raw.id,
    invoiceNo: raw.invoiceNo ?? '',
    clientName: raw.clientName ?? '',
    invoiceDate: raw.invoiceDate ?? '',
    notes: raw.notes,
    createdBy: raw.createdBy ?? { id: 0, name: '' },
    total: raw.total ?? 0,
    created_at: raw.created_at ?? '',
    paymentStatus: raw.paymentStatus ?? InvoicePaymentStatus.PENDING,
    totalPaid: raw.totalPaid ?? null,
    remainingBalance: raw.remainingBalance ?? null,
    items: (raw.items ?? []).map(
      (item): ClientInvoiceDetailItem => ({
        id: item.id,
        index: item.index,
        particulars: item.particulars,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,
      }),
    ),
  };
}

export interface RawSubcontractorInvoiceListItem {
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

export function normaliseSubcontractorInvoiceListItem(
  raw: RawSubcontractorInvoiceListItem,
): SubcontractorInvoiceListItem {
  return {
    id: raw.id,
    invoiceNo: raw.invoiceNo ?? '',
    contractorName: raw.contractorName ?? '',
    invoiceDate: raw.invoiceDate ?? '',
    total: raw.total ?? 0,
    createdAt: raw.createdAt ?? raw.updatedAt ?? '',
    createdBy: raw.createdBy,
    paymentStatus: raw.paymentStatus,
  };
}

export function normaliseSubcontractorInvoiceListItems(
  raw: RawSubcontractorInvoiceListItem[],
): SubcontractorInvoiceListItem[] {
  return raw.map(normaliseSubcontractorInvoiceListItem);
}

export interface RawSubcontractorInvoiceDetail {
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

export function normaliseSubcontractorInvoiceDetail(
  raw: RawSubcontractorInvoiceDetail,
): SubcontractorInvoiceDetail {
  return {
    id: raw.id,
    invoiceNo: raw.invoiceNo ?? '',
    contractorName: raw.contractorName ?? '',
    invoiceDate: raw.invoiceDate ?? '',
    notes: raw.notes ?? null,
    createdBy: raw.createdBy ?? { name: '', email: '', phone: '' },
    total: raw.total ?? 0,
    created_at: raw.created_at ?? '',
    items: raw.items ?? [],
    paymentStatus: raw.paymentStatus,
  };
}

export interface RawPaymentRecord {
  id: number;
  amount: number;
  payment_date: string;
  notes?: string | null;
  recorded_by?: string | null;
}

export interface RawPaymentHistory {
  invoice_id: number;
  total_invoice_value: number;
  total_paid: number;
  remaining_balance: number;
  payments?: RawPaymentRecord[];
}
export function normalisePaymentHistory(raw: RawPaymentHistory): PaymentHistory {
  return {
    invoice_id: raw.invoice_id,
    total_invoice_value: raw.total_invoice_value ?? 0,
    total_paid: raw.total_paid ?? 0,
    remaining_balance: raw.remaining_balance ?? 0,
    payments: (raw.payments ?? []).map(
      (p): PaymentRecord => ({
        id: p.id,
        amount: p.amount,
        payment_date: p.payment_date,
        notes: p.notes ?? null,
        recorded_by: p.recorded_by ?? null,
      }),
    ),
  };
}

export function normaliseSubcontractorPaymentHistory(raw: RawPaymentHistory): PaymentHistorySummary {
  return {
    invoiceId: raw.invoice_id,
    totalInvoiceValue: raw.total_invoice_value ?? 0,
    totalPaid: raw.total_paid ?? 0,
    remainingBalance: raw.remaining_balance ?? 0,
    payments: (raw.payments ?? []).map(
      (p): PaymentHistoryEntry => ({
        id: p.id,
        amount: p.amount,
        notes: p.notes ?? null,
        paymentDate: p.payment_date,
        recordedBy: p.recorded_by ?? null,
      }),
    ),
  };
}