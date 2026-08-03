'use client';

import { useState, useEffect, useCallback } from 'react';
import { CompanyInvoice, InvoicePaymentStatus } from '@/types/company_invoices';
import {
  fetchCompanyInvoiceDetail,
  updateCompanyInvoiceStatus,
  recordCompanyInvoicePayment,
  RecordPaymentPayload,
} from '@/lib/api/company-invoices';
import { useInvoicePdfDownload, mapCompanyInvoiceToPdfData } from '@/lib/utils/invoice-pdf-download';

const previewKey = (id: string) => `cinv_${id}`;

export function useCompanyInvoiceDetail(id: string | undefined) {
  const [invoice, setInvoice]             = useState<CompanyInvoice | null>(null);
  const [loading, setLoading]             = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejecting, setRejecting]                 = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const { downloading, handleDownload } = useInvoicePdfDownload(
    invoice,
    mapCompanyInvoiceToPdfData,
  );

  useEffect(() => {
    if (!id) return;

    const cached = sessionStorage.getItem(previewKey(id));
    if (cached) {
      try {
        const partial = JSON.parse(cached);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvoice({
          id:                Number(id),
          invoice_number:    partial.invoice_number,
          invoiced_by:       partial.invoiced_by,
          invoice_date:      partial.invoice_date,
          total:             partial.total,
          payment_status:    partial.payment_status ?? InvoicePaymentStatus.PENDING,
          total_paid:        null,
          remaining_balance: null,
          source:            null,
          requester:         null,
          notes:             null,
          created_at:        null,
          updated_at:        null,
          items:             [],
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

  const handleReject = useCallback(async () => {
    if (!invoice) return;
    setRejecting(true);
    try {
      const result = await updateCompanyInvoiceStatus(invoice.id, InvoicePaymentStatus.REJECTED);
      setInvoice((prev) => (prev ? { ...prev, payment_status: result.payment_status } : prev));
    } finally {
      setRejecting(false);
    }
  }, [invoice]);

  const handleRecordPayment = useCallback(async (payload: RecordPaymentPayload) => {
    if (!invoice) return;
    setPaymentSubmitting(true);
    try {
      const result = await recordCompanyInvoicePayment(invoice.id, payload);
      setInvoice((prev) =>
        prev
          ? {
              ...prev,
              payment_status:    result.payment_status,
              total_paid:        result.total_paid,
              remaining_balance: result.remaining_balance,
            }
          : prev
      );
    } finally {
      setPaymentSubmitting(false);
    }
  }, [invoice]);

  return {
    invoice,
    loading,
    detailLoading,
    downloading,
    handleDownload,
    rejecting,
    paymentSubmitting,
    handleReject,
    handleRecordPayment,
  };
}