'use client';

import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '@/types/invoice';
import { fetchSupplierInvoiceDetail } from '@/lib/api/supplier-invoices';
import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';

const previewKey = (id: string) => `invoice_${id}_preview`;

export function useSupplierInvoiceDetail(id: string | undefined) {
  const [invoice, setInvoice]         = useState<Invoice | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const raw = sessionStorage.getItem(previewKey(id));
    if (raw) {
      try {
        const preview = JSON.parse(raw) as Invoice;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvoice(preview);
        setIsLoading(false);
        setIsEnriching(true);
      } catch {
        /* ignore bad JSON */
      }
    }

    fetchSupplierInvoiceDetail(id)
      .then((full) => {
        setInvoice((prev) => ({
          ...prev,
          ...full,
          site:         full.site         ?? prev?.site         ?? null,
          invoice_date: full.invoice_date ?? prev?.invoice_date ?? null,
          submitted_by: full.submitted_by ?? prev?.submitted_by ?? null,
        }));
      })
      .catch((err) => console.error('Failed to load invoice:', err))
      .finally(() => {
        setIsLoading(false);
        setIsEnriching(false);
      });
  }, [id]);

  const handleDownload = useCallback(async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await generateInvoicePDF({
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
      });
    } finally {
      setDownloading(false);
    }
  }, [invoice]);

  const balance = invoice ? invoice.total_amount - invoice.amount_paid : 0;

  return { invoice, isLoading, isEnriching, downloading, handleDownload, balance };
}