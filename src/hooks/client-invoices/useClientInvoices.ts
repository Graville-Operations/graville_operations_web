'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientInvoiceListItem, InvoicePaymentStatus } from '@/types/client-invoice';
import { fetchClientInvoices } from '@/lib/api/client-invoices';
import { parseBackendDate, todayISO } from '@/lib/utils/date';
import { useSiteStore } from '@/store/site-store';

export function useClientInvoices() {
  const today = todayISO();

  const [invoices, setInvoices] = useState<ClientInvoiceListItem[]>([]);
  const [filtered, setFiltered] = useState<ClientInvoiceListItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const sites = useSiteStore((s) => s.sites);
  const fetchSitesAction = useSiteStore((s) => s.fetchSites);

  const [siteId, setSiteId] = useState('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeDateLabel, setActiveDateLabel] = useState('');

  const [statusFilter, setStatusFilter] = useState<InvoicePaymentStatus | null>(null);

  const filtersRef = useRef({ siteId, statusFilter });
  useEffect(() => {
    filtersRef.current = { siteId, statusFilter };
  }, [siteId, statusFilter]);

  useEffect(() => {
    fetchSitesAction(); 
  }, [fetchSitesAction]);

  const loadInvoices = async (sid?: string, status?: InvoicePaymentStatus | null) => {
    try {
      setIsLoading(true);
      const { items, total: t } = await fetchClientInvoices(
        sid ? Number(sid) : undefined,
        status ?? undefined,
      );
      setInvoices(items);
      setFiltered(items);
      setTotal(t);
    } catch (err) {
      console.error('[ClientInvoices]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(siteId, statusFilter);
  }, [siteId, statusFilter]);

  useEffect(() => {
    const refetch = () => {
      const { siteId: sid, statusFilter: status } = filtersRef.current;
      loadInvoices(sid, status);
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      let result = invoices.filter(
        (inv) =>
          inv.invoiceNo?.toLowerCase().includes(q) ||
          inv.clientName?.toLowerCase().includes(q),
      );
      if (dateFrom && dateTo) {
        result = result.filter((inv) => {
          const d = parseBackendDate(inv.invoiceDate);
          return d !== '' && d >= dateFrom && d <= dateTo;
        });
      }
      setFiltered(result);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, invoices, dateFrom, dateTo]);

  const applyDateFilter = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setActiveDateLabel(from === to ? `On ${from}` : `${from} → ${to}`);
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setActiveDateLabel('');
  };

  const clearAllFilters = () => {
    setSiteId('');
    setStatusFilter(null);
    clearDateFilter();
  };

  const hasActiveFilters = !!(siteId || activeDateLabel || statusFilter);

  return {
    today,
    filtered, search, setSearch, isLoading, total, sites,
    siteId, setSiteId,
    dateFrom, dateTo, activeDateLabel, applyDateFilter, clearDateFilter, clearAllFilters,
    statusFilter, setStatusFilter,
    hasActiveFilters,
  };
}