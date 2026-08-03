'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyInvoice, InvoicePaymentStatus, normaliseCompanyInvoice } from '@/types/company_invoices';
import { fetchCompanyInvoices } from '@/lib/api/company-invoices';

export function useCompanyInvoices() {
  const router = useRouter();

  const [invoices, setInvoices]         = useState<CompanyInvoice[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [appliedLabel, setAppliedLabel] = useState('');
  const [dateRange, setDateRange]       = useState<{ start?: string; end?: string }>({});
  const [statusFilter, setStatusFilterState] = useState<InvoicePaymentStatus | null>(null);

  const filtersRef = useRef({ dateRange, statusFilter });
  useEffect(() => {
    filtersRef.current = { dateRange, statusFilter };
  }, [dateRange, statusFilter]);

  const loadInvoices = useCallback(
    async (start?: string, end?: string, status?: InvoicePaymentStatus | null) => {
      try {
        setIsLoading(true);
        const raw = await fetchCompanyInvoices({
          startDate: start,
          endDate: end,
          status: status ?? undefined,
        });
        setInvoices(raw.map(normaliseCompanyInvoice));
      } catch (err) {
        console.error('Failed to fetch company invoices:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();
  }, [loadInvoices]);

  // Refetch whenever the page becomes visible again (e.g. navigating back
  // from a detail page after a status update or payment) or the window
  // regains focus, so the table never shows stale payment statuses.
  useEffect(() => {
    const refetch = () => {
      const { dateRange: dr, statusFilter: sf } = filtersRef.current;
      loadInvoices(dr.start, dr.end, sf);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refetch();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', refetch);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refetch);
    };
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
      setDateRange({ start, end });
      setAppliedLabel(label);
      loadInvoices(start, end, statusFilter);
    },
    [loadInvoices, statusFilter]
  );

  const clearDateFilter = useCallback(() => {
    setAppliedLabel('');
    setDateRange({});
    loadInvoices(undefined, undefined, statusFilter);
  }, [loadInvoices, statusFilter]);

  const setStatusFilter = useCallback(
    (status: InvoicePaymentStatus | null) => {
      setStatusFilterState(status);
      loadInvoices(dateRange.start, dateRange.end, status);
    },
    [loadInvoices, dateRange]
  );

  const openDetail = useCallback(
    (inv: CompanyInvoice) => {
      sessionStorage.setItem(
        `cinv_${inv.id}`,
        JSON.stringify({
          invoice_number: inv.invoice_number,
          invoiced_by:    inv.invoiced_by,
          invoice_date:   inv.invoice_date,
          total:          inv.total,
          payment_status: inv.payment_status,
        })
      );
      router.push(`/finance/invoice/company/${inv.id}`);
    },
    [router]
  );

  const hasFilter = !!(search || appliedLabel || statusFilter);

  return {
    filtered,
    isLoading,
    search,
    setSearch,
    appliedLabel,
    applyDateFilter,
    clearDateFilter,
    statusFilter,
    setStatusFilter,
    openDetail,
    hasFilter,
  };
}