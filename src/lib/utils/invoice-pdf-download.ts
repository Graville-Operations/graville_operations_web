import { useCallback, useState } from 'react';
import { generateInvoicePDF, InvoicePDFData } from '@/lib/utils/generate-invoice-pdf';
import { ClientInvoiceDetail } from '@/types/client-invoice';
import { CompanyInvoice } from '@/types/company_invoices';
import { Invoice } from '@/types/invoice';
import { SubcontractorInvoiceDetail } from '@/types/subcontractor-invoice';

export function useInvoicePdfDownload<T>(
  invoice: T | null | undefined,
  mapToPdfData: (invoice: T) => InvoicePDFData,
) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await generateInvoicePDF(mapToPdfData(invoice));
    } catch (err) {
      console.error('[PDF export]', err);
    } finally {
      setDownloading(false);
    }
  }, [invoice, mapToPdfData]);

  return { downloading, handleDownload };
}


export function mapClientInvoiceToPdfData(invoice: ClientInvoiceDetail): InvoicePDFData {
  return {
    invoiceNo:   invoice.invoiceNo,
    invoiceType: 'Client',
    clientName:  invoice.clientName,
    invoiceDate: invoice.invoiceDate,
    notes:       invoice.notes,
    createdBy:   invoice.createdBy?.name ?? '—',
    createdAt:   invoice.created_at,
    total:       invoice.total,
    items: invoice.items.map((item) => ({
      index:       item.index,
      particulars: item.particulars,
      quantity:    item.quantity,
      unitPrice:   item.unitPrice,
      totalAmount: item.totalAmount,
    })),
  };
}

export function mapCompanyInvoiceToPdfData(invoice: CompanyInvoice): InvoicePDFData {
  return {
    invoiceNo:   invoice.invoice_number,
    invoiceType: 'Company',
    clientName:  invoice.invoiced_by ?? '—',
    invoiceDate: invoice.invoice_date ?? '—',
    createdBy:   invoice.invoiced_by ?? '—',
    createdAt:   invoice.created_at  ?? '—',
    total:       invoice.total,
    notes:       invoice.notes ?? undefined,
    items: (invoice.items ?? []).map((item) => ({
      index:       item.index,
      particulars: item.particulars,
      quantity:    item.quantity,
      unitPrice:   item.unit_price,
      totalAmount: item.total_amount,
    })),
  };
}

export function mapSupplierInvoiceToPdfData(invoice: Invoice): InvoicePDFData {
  return {
    invoiceNo:      invoice.invoice_number,
    invoiceType:    'Supplier',
    clientName:     invoice.supplier_name ?? '—',
    invoiceDate:    invoice.invoice_date  ?? '—',
    createdBy:      invoice.submitted_by  ?? '—',
    createdAt:      invoice.created_at    ?? '—',
    total:          invoice.total_amount,
    notes:          invoice.notes ?? undefined,
    lpoNumber:      invoice.lpo_number      ?? undefined,
    deliveryNumber: invoice.delivery_number ?? undefined,
    site:           invoice.site            ?? undefined,
    status:         invoice.status          ?? undefined,
    amountPaid:     invoice.amount_paid,
    balanceDue:     invoice.total_amount - invoice.amount_paid,
    items: (invoice.items ?? []).map((item, i) => ({
      index:       i + 1,
      particulars: item.particular,
      quantity:    item.quantity,
      unitPrice:   item.unit_price,
      totalAmount: item.total_price,
    })),
  };
}

export function mapContractorInvoiceToPdfData(invoice: SubcontractorInvoiceDetail): InvoicePDFData {
  return {
    invoiceNo:   invoice.invoiceNo,
    invoiceType: 'Contractor',
    clientName:  invoice.contractorName,
    invoiceDate: invoice.invoiceDate,
    notes:       invoice.notes ?? undefined,
    createdBy:   invoice.createdBy?.name ?? '—',
    createdAt:   invoice.created_at,
    total:       invoice.total,
    items:       invoice.items,
  };
}