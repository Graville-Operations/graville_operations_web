'use client';

import { useState, useEffect } from 'react';
import { fetchCompanyInvoicePaymentHistory } from '@/lib/api/company-invoices';
import { PaymentHistory } from '@/types/company_invoices';

export function useCompanyPaymentHistory(id: string | undefined) {
  const [history, setHistory] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await fetchCompanyInvoicePaymentHistory(id);
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return { history, loading, error };
}