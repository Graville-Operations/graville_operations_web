'use client';

import { useState, useEffect } from 'react';
import { fetchClientInvoicePaymentHistory } from '@/lib/api/client-invoices';
import { PaymentHistory } from '@/types/client-invoice';

export function useClientPaymentHistory(id: string | undefined) {
  const [history, setHistory] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await fetchClientInvoicePaymentHistory(id);
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