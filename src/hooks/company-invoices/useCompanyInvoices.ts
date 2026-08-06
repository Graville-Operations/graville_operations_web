'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyInvoice, InvoicePaymentStatus } from '@/types/company_invoices';
import { normaliseCompanyInvoice } from '@/lib/mappers/invoice-mappers';
import { fetchCompanyInvoices } from '@/lib/api/company-invoices';
import { ROUTES } from '@/lib/routes';

function formatDateLabel(start?: string, end?: string): string {
  if (start && end) return start === end ? start : `${start} → ${end}`;
  return start || end || '';
}

export function useCompanyInvoices() {
  const router = useRouter();

  const [invoices, setInvoices]         = useState<CompanyInvoice[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [dateRange, setDateRange]       = useState<{ start?: string; end?: string }>({});
  const [statusFilter, setStatusFilterState] = useState<InvoicePaymentStatus | null>(null);

  const appliedLabel = formatDateLabel(dateRange.start, dateRange.end);

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
    (start: string, end: string) => {
      setDateRange({ start: start || undefined, end: end || undefined });
      loadInvoices(start || undefined, end || undefined, statusFilter);
    },
    [loadInvoices, statusFilter]
  );

  const clearDateFilter = useCallback(() => {
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
      router.push(ROUTES.finance.invoice.company.detail(String(inv.id)));
    },
    [router]
  );

  const hasFilter = !!(search || appliedLabel || statusFilter);

  return {
    filtered,
    isLoading,
    search,
    setSearch,
    dateFrom: dateRange.start ?? '',
    dateTo: dateRange.end ?? '',
    appliedLabel,
    applyDateFilter,
    clearDateFilter,
    statusFilter,
    setStatusFilter,
    openDetail,
    hasFilter,
  };
}