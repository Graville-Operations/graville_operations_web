'use client';

import { useState, useEffect, useCallback } from 'react';
import { CompanyInvoice } from '@/types/company_invoices';
import { fetchCompanyInvoiceDetail } from '@/lib/api/company-invoices';
import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';

const previewKey = (id: string) => `cinv_${id}`;

export function useCompanyInvoiceDetail(id: string | undefined) {
  const [invoice, setInvoice]             = useState<CompanyInvoice | null>(null);
  const [loading, setLoading]             = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloading, setDownloading]     = useState(false);

  useEffect(() => {
    if (!id) return;

    const cached = sessionStorage.getItem(previewKey(id));
    if (cached) {
      try {
        const partial = JSON.parse(cached);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvoice({
          id:             Number(id),
          invoice_number: partial.invoice_number,
          invoiced_by:    partial.invoiced_by,
          invoice_date:   partial.invoice_date,
          total:          partial.total,
          source:         null,
          requester:      null,
          notes:          null,
          created_at:     null,
          updated_at:     null,
          items:          [],
        });
        setLoading(false);
      } catch {
        /* ignore bad JSON */
      }
    }

    const load = async () => {
      try {
        setDetailLoading(true);
        const full = await fetchCompanyInvoiceDetail(id);
        setInvoice(full);
        sessionStorage.removeItem(previewKey(id));
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
      } finally {
        setDetailLoading(false);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = useCallback(async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await generateInvoicePDF({
        invoiceNo:   invoice.invoice_number,
        invoiceType: 'Company',
        clientName:  invoice.invoiced_by ?? '—',
        invoiceDate: invoice.invoice_date ?? '—',
        createdBy:   invoice.invoiced_by  ?? '—',
        createdAt:   invoice.created_at   ?? '—',
        total:       invoice.total,
        notes:       invoice.notes ?? undefined,
        items: (invoice.items ?? []).map((item) => ({
          index:       item.index,
          particulars: item.particulars,
          quantity:    item.quantity,
          unitPrice:   item.unit_price,
          totalAmount: item.total_amount,
        })),
      });
    } finally {
      setDownloading(false);
    }
  }, [invoice]);

  return { invoice, loading, detailLoading, downloading, handleDownload };
}