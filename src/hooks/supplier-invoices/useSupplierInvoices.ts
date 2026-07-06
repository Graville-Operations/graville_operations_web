'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, normaliseInvoice } from '@/types/invoice';
import { fetchSites, fetchSupplierInvoices, Site } from '@/lib/api/supplier-invoices';

export function useSupplierInvoices() {
  const router = useRouter();

  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [sites, setSites]         = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [siteId, setSiteId]       = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch((err) => console.error('Failed to fetch sites:', err));
  }, []);

  const loadInvoices = useCallback(async (sid: string, start: string, end: string) => {
    try {
      setIsLoading(true);
      const raw = await fetchSupplierInvoices({ siteId: sid, startDate: start, endDate: end });
      setInvoices(raw.map(normaliseInvoice));
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices(siteId, startDate, endDate);
  }, [siteId, startDate, endDate, loadInvoices]);

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

  const hasFilter = !!(search || siteId || startDate || endDate);

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
      router.push(`/finance/invoice/supplier/${inv.id}`);
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
    filtered,
    hasFilter,
    openDetail,
    clearAllFilters,
  };
}