'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSubcontractorInvoiceDetail } from '@/lib/api/subcontractor-invoices';
import type { SubcontractorInvoiceDetail } from '@/types/subcontractor-invoice';

export function useSubcontractorInvoiceDetail(invoiceId: number) {
  const [invoice, setInvoice] = useState<SubcontractorInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setInvoice(null);
    try {
      const data = await fetchSubcontractorInvoiceDetail(id);
      setInvoice(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(invoiceId);
  }, [invoiceId, load]);

  return { invoice, loading, error, retry: () => load(invoiceId) };
}