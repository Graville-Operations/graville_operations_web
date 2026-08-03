'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchClientInvoiceDetail,
  updateClientInvoiceStatus,
  recordClientInvoicePayment,
  RecordPaymentPayload,
} from '@/lib/api/client-invoices';
import { ClientInvoiceDetail, InvoicePreview, InvoicePaymentStatus } from '@/types/client-invoice';
import { useInvoicePdfDownload, mapClientInvoiceToPdfData } from '@/lib/utils/invoice-pdf-download';

const TIMEOUT_MS = 10_000;
const RETRY_DELAY_S = 3;

export function useClientInvoiceDetail() {
  const [id, setId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<ClientInvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState<number | null>(null);
  const [preview, setPreview] = useState<InvoicePreview>({});
  const [rejecting, setRejecting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const { downloading: isExporting, handleDownload } = useInvoicePdfDownload(
    invoice,
    mapClientInvoiceToPdfData,
  );

  const resolvedRef = useRef(false);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const invoiceId = segments[segments.length - 1];
    if (invoiceId && !isNaN(Number(invoiceId))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setId(invoiceId);
      try {
        const raw = sessionStorage.getItem(`invoice-preview-${invoiceId}`);
        if (raw) setPreview(JSON.parse(raw));
      } catch { /* ignore */ }
    } else {
      setError('Invalid invoice ID in URL');
      setIsLoading(false);
    }
  }, []);

  const load = useCallback(async (invoiceId: string) => {
    clearTimers();
    cancelledRef.current = false;
    resolvedRef.current = false;

    setIsLoading(true);
    setError(null);
    setRetryIn(null);

    timeoutRef.current = setTimeout(() => {
      if (resolvedRef.current || cancelledRef.current) return;
      let countdown = RETRY_DELAY_S;

      tickRef.current = setInterval(() => {
        if (resolvedRef.current || cancelledRef.current) {
          clearTimers();
          setRetryIn(null);
          return;
        }
        countdown -= 1;
        if (countdown <= 0) {
          clearTimers();
          setRetryIn(null);
          // eslint-disable-next-line react-hooks/immutability
          load(invoiceId);
        }
      }, 1000);
    }, TIMEOUT_MS);

    try {
      const detail = await fetchClientInvoiceDetail(invoiceId);
      resolvedRef.current = true;
      clearTimers();
      if (cancelledRef.current) return;
      setInvoice(detail);
      setRetryIn(null);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      resolvedRef.current = true;
      clearTimers();
      if (cancelledRef.current) return;
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load invoice');
      setRetryIn(null);
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [clearTimers]);

  useEffect(() => {
    if (!id) return;
    load(id);
    return () => {
      cancelledRef.current = true;
      resolvedRef.current = true;
      clearTimers();
    };
  }, [id, load, clearTimers]);

  const handleReject = useCallback(async () => {
    if (!invoice) return;
    setRejecting(true);
    try {
      const result = await updateClientInvoiceStatus(invoice.id, InvoicePaymentStatus.REJECTED);
      setInvoice((prev) => (prev ? { ...prev, paymentStatus: result.payment_status } : prev));
    } finally {
      setRejecting(false);
    }
  }, [invoice]);

  const handleRecordPayment = useCallback(async (payload: RecordPaymentPayload) => {
    if (!invoice) return;
    setPaymentSubmitting(true);
    try {
      const result = await recordClientInvoicePayment(invoice.id, payload);
      setInvoice((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: result.payment_status,
              totalPaid: result.total_paid,
              remainingBalance: result.remaining_balance,
            }
          : prev
      );
    } finally {
      setPaymentSubmitting(false);
    }
  }, [invoice]);

  return {
    id, invoice, isLoading, isExporting, error, retryIn, preview, load, handleDownload,
    rejecting, paymentSubmitting, handleReject, handleRecordPayment,
  };
}