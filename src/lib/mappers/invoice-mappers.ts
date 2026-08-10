import { InvoicePaymentStatus } from '@/types/enums/invoice-payment-status';
import type { CreatedByDTO, SupplierInvoiceDTO, Invoice, InvoiceItem } from '@/types/invoice';
import type {
  CompanyInvoiceDTO,
  CompanyInvoice,
  CompanyInvoiceItem,
  PaymentHistory,
  PaymentRecord,
  PaymentHistoryDTO,
} from '@/types/company_invoices';
import type {
  ClientInvoiceListItem,
  ClientInvoiceListItemDTO,
  ClientInvoiceDetail,
  ClientInvoiceDetailDTO,
  ClientInvoiceDetailItem,
} from '@/types/client-invoice';
import type {
  SubcontractorInvoiceListItem,
  SubcontractorInvoiceListItemDTO,
  SubcontractorInvoiceDetail,
  SubcontractorInvoiceDetailDTO,
  PaymentHistorySummary,
  PaymentHistoryEntry,
} from '@/types/subcontractor-invoice';

function resolveCreatedByName(createdBy: CreatedByDTO | string | null | undefined): string | null {
  if (!createdBy) return null;
  return typeof createdBy === 'string' ? createdBy : createdBy.name ?? null;
}

export function normaliseSupplierInvoice(dto: SupplierInvoiceDTO): Invoice {
  return {
    id: dto.id,
    invoice_number: dto.invoiceNo,
    lpo_number: dto.lpoNo ?? null,
    delivery_number: dto.deliveryNo ?? null,
    supplier_name: dto.supplierName,
    invoice_date: dto.invoiceDate,
    total_amount: dto.total,
    amount_paid: dto.amountPaid ?? 0,
    status: dto.paymentStatus ?? InvoicePaymentStatus.PENDING,
    total_paid: null,
    remaining_balance: null,
    site: dto.source ?? null,
    submitted_by: dto.requester ?? resolveCreatedByName(dto.createdBy),
    submitted_by_id: 0,
    notes: dto.notes ?? null,
    created_at: dto.created_at ?? dto.updatedAt ?? null,
    items: (dto.items ?? []).map(
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

export function normaliseCompanyInvoice(dto: CompanyInvoiceDTO): CompanyInvoice {
  return {
    id: dto.id,
    invoice_number: dto.invoiceNo,
    invoiced_by: resolveCreatedByName(dto.invoicedBy),
    source: dto.source ?? null,
    requester: dto.requester ?? null,
    invoice_date: dto.invoiceDate ?? null,
    notes: dto.notes ?? null,
    total: dto.total,
    payment_status: dto.paymentStatus ?? InvoicePaymentStatus.PENDING,
    total_paid: null,
    remaining_balance: null,
    created_at: dto.created_at ?? null,
    updated_at: dto.updatedAt ?? null,
    items: (dto.items ?? []).map(
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

export function normaliseClientInvoiceListItem(dto: ClientInvoiceListItemDTO): ClientInvoiceListItem {
  return {
    id: dto.id,
    invoiceNo: dto.invoiceNo ?? '',
    clientName: dto.clientName ?? '',
    invoiceDate: dto.invoiceDate ?? '',
    total: dto.total ?? 0,
    createdAt: dto.createdAt ?? dto.updatedAt ?? '',
    site_id: dto.site_id,
    paymentStatus: dto.paymentStatus,
  };
}

export function normaliseClientInvoiceListItems(dtos: ClientInvoiceListItemDTO[]): ClientInvoiceListItem[] {
  return dtos.map(normaliseClientInvoiceListItem);
}

export function normaliseClientInvoiceDetail(dto: ClientInvoiceDetailDTO): ClientInvoiceDetail {
  return {
    id: dto.id,
    invoiceNo: dto.invoiceNo ?? '',
    clientName: dto.clientName ?? '',
    invoiceDate: dto.invoiceDate ?? '',
    notes: dto.notes,
    createdBy: dto.createdBy ?? { id: 0, name: '' },
    total: dto.total ?? 0,
    created_at: dto.created_at ?? '',
    paymentStatus: dto.paymentStatus ?? InvoicePaymentStatus.PENDING,
    totalPaid: dto.totalPaid ?? null,
    remainingBalance: dto.remainingBalance ?? null,
    items: (dto.items ?? []).map(
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

export function normaliseSubcontractorInvoiceListItem(
  dto: SubcontractorInvoiceListItemDTO,
): SubcontractorInvoiceListItem {
  return {
    id: dto.id,
    invoiceNo: dto.invoiceNo ?? '',
    contractorName: dto.contractorName ?? '',
    invoiceDate: dto.invoiceDate ?? '',
    total: dto.total ?? 0,
    createdAt: dto.createdAt ?? dto.updatedAt ?? '',
    createdBy: dto.createdBy,
    paymentStatus: dto.paymentStatus,
  };
}

export function normaliseSubcontractorInvoiceListItems(
  dtos: SubcontractorInvoiceListItemDTO[],
): SubcontractorInvoiceListItem[] {
  return dtos.map(normaliseSubcontractorInvoiceListItem);
}

export function normaliseSubcontractorInvoiceDetail(
  dto: SubcontractorInvoiceDetailDTO,
): SubcontractorInvoiceDetail {
  return {
    id: dto.id,
    invoiceNo: dto.invoiceNo ?? '',
    contractorName: dto.contractorName ?? '',
    invoiceDate: dto.invoiceDate ?? '',
    notes: dto.notes ?? null,
    createdBy: dto.createdBy ?? { name: '', email: '', phone: '' },
    total: dto.total ?? 0,
    created_at: dto.created_at ?? '',
    items: dto.items ?? [],
    paymentStatus: dto.paymentStatus,
  };
}

export function normalisePaymentHistory(dto: PaymentHistoryDTO): PaymentHistory {
  return {
    invoice_id: dto.invoice_id,
    total_invoice_value: dto.total_invoice_value ?? 0,
    total_paid: dto.total_paid ?? 0,
    remaining_balance: dto.remaining_balance ?? 0,
    payments: (dto.payments ?? []).map(
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

export function normaliseSubcontractorPaymentHistory(dto: PaymentHistoryDTO): PaymentHistorySummary {
  return {
    invoiceId: dto.invoice_id,
    totalInvoiceValue: dto.total_invoice_value ?? 0,
    totalPaid: dto.total_paid ?? 0,
    remainingBalance: dto.remaining_balance ?? 0,
    payments: (dto.payments ?? []).map(
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