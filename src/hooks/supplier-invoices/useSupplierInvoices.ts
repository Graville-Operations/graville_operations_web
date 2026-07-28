'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, InvoicePaymentStatus, normaliseInvoice } from '@/types/invoice';
import { fetchSupplierInvoices } from '@/lib/api/supplier-invoices';
import { ROUTES } from '@/lib/routes';
import { useSiteStore } from '@/store/site-store';

export function useSupplierInvoices() {
  const router = useRouter();

  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const sites = useSiteStore((s) => s.sites);
  const fetchSitesAction = useSiteStore((s) => s.fetchSites);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [siteId, setSiteId]       = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoicePaymentStatus | null>(null);

  const filtersRef = useRef({ siteId, startDate, endDate, statusFilter });
  useEffect(() => {
    filtersRef.current = { siteId, startDate, endDate, statusFilter };
  }, [siteId, startDate, endDate, statusFilter]);

  useEffect(() => {
    fetchSitesAction(); // idempotent — no-op if already cached from login
  }, [fetchSitesAction]);

  const loadInvoices = useCallback(
    async (sid: string, start: string, end: string, status: InvoicePaymentStatus | null) => {
      try {
        setIsLoading(true);
        const raw = await fetchSupplierInvoices({
          siteId: sid,
          startDate: start,
          endDate: end,
          status: status ?? undefined,
        });
        setInvoices(raw.map(normaliseInvoice));
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices(siteId, startDate, endDate, statusFilter);
  }, [siteId, startDate, endDate, statusFilter, loadInvoices]);

  useEffect(() => {
    const refetch = () => {
      const { siteId: sid, startDate: s, endDate: e, statusFilter: st } = filtersRef.current;
      loadInvoices(sid, s, e, st);
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
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.supplier_name.toLowerCase().includes(q) ||
        (inv.submitted_by ?? '').toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const hasFilter = !!(search || siteId || startDate || endDate || statusFilter);

  const openDetail = useCallback(
    (inv: Invoice) => {
      sessionStorage.setItem(
        `invoice_${inv.id}_preview`,
        JSON.stringify({
          invoice_number: inv.invoice_number,
          supplier_name:  inv.supplier_name,
          status:         inv.status,
          total_amount:   inv.total_amount,
          amount_paid:    inv.amount_paid,
          submitted_by:   inv.submitted_by ?? '',
          site:           inv.site ?? '',
          invoice_date:   inv.invoice_date ?? '',
        })
      );
      router.push(ROUTES.finance.invoice.supplier.detail(String(inv.id)));
    },
    [router]
  );

  const applyDateFilter = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const clearDateFilter = useCallback(() => {
    setStartDate('');
    setEndDate('');
  }, []);

  const clearAllFilters = useCallback(() => {
    setSiteId('');
    setStartDate('');
    setEndDate('');
    setStatusFilter(null);
  }, []);

  return {
    sites,
    isLoading,
    search,
    setSearch,
    siteId,
    setSiteId,
    startDate,
    endDate,
    applyDateFilter,
    clearDateFilter,
    statusFilter,
    setStatusFilter,
    filtered,
    hasFilter,
    openDetail,
    clearAllFilters,
  };
}