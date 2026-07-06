'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyInvoice, normaliseCompanyInvoice } from '@/types/company_invoices';
import { fetchCompanyInvoices } from '@/lib/api/company-invoices';

export function useCompanyInvoices() {
  const router = useRouter();

  const [invoices, setInvoices]         = useState<CompanyInvoice[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [appliedLabel, setAppliedLabel] = useState('');

  const loadInvoices = useCallback(async (start?: string, end?: string) => {
    try {
      setIsLoading(true);
      const raw = await fetchCompanyInvoices({ startDate: start, endDate: end });
      setInvoices(raw.map(normaliseCompanyInvoice));
    } catch (err) {
      console.error('Failed to fetch company invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();
  }, [loadInvoices]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (i) =>
        i.invoice_number.toLowerCase().includes(q) ||
        (i.invoiced_by ?? '').toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const applyDateFilter = useCallback(
    (start: string | undefined, end: string | undefined, label: string) => {
      loadInvoices(start, end);
      setAppliedLabel(label);
    },
    [loadInvoices]
  );

  const clearDateFilter = useCallback(() => {
    setAppliedLabel('');
    loadInvoices();
  }, [loadInvoices]);

  const openDetail = useCallback(
    (inv: CompanyInvoice) => {
      sessionStorage.setItem(
        `cinv_${inv.id}`,
        JSON.stringify({
          invoice_number: inv.invoice_number,
          invoiced_by:    inv.invoiced_by,
          invoice_date:   inv.invoice_date,
          total:          inv.total,
        })
      );
      router.push(`/finance/invoice/company/${inv.id}`);
    },
    [router]
  );

  const hasFilter = !!(search || appliedLabel);

  return {
    filtered,
    isLoading,
    search,
    setSearch,
    appliedLabel,
    applyDateFilter,
    clearDateFilter,
    openDetail,
    hasFilter,
  };
}