'use client';

import { useState, useEffect, useRef } from 'react';
import { Site } from '@/types';
import { ClientInvoiceListItem, DateFilterMode, InvoicePaymentStatus } from '@/types/client-invoice';
import { fetchSites, fetchClientInvoices } from '@/lib/api/client-invoices';
import { parseBackendDate, todayISO } from '@/lib/utils/date';

export function useClientInvoices() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const today = todayISO();

  const [invoices, setInvoices] = useState<ClientInvoiceListItem[]>([]);
  const [filtered, setFiltered] = useState<ClientInvoiceListItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sites, setSites] = useState<Site[]>([]);

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [siteOpen, setSiteOpen] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateMode, setDateMode] = useState<DateFilterMode>('single');
  const [singleDate, setSingleDate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeDateLabel, setActiveDateLabel] = useState('');

  const [statusFilter, setStatusFilter] = useState<InvoicePaymentStatus | null>(null);

  // Keep the latest site/status filters in a ref so the visibility
  // listener (registered once) always refetches using current values,
  // not whatever they were when the listener was first attached.
  const filtersRef = useRef({ selectedSite, statusFilter });
  useEffect(() => {
    filtersRef.current = { selectedSite, statusFilter };
  }, [selectedSite, statusFilter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setCalendarOpen(false);
      if (siteRef.current && !siteRef.current.contains(e.target as Node))
        setSiteOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchSites(100)
      .then(setSites)
      .catch((err) => console.error('[Sites]', err));
  }, []);

  const loadInvoices = async (siteId?: number, status?: InvoicePaymentStatus | null) => {
    try {
      setIsLoading(true);
      const { items, total: t } = await fetchClientInvoices(siteId, status ?? undefined);
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
    loadInvoices(selectedSite?.id, statusFilter);
  }, [selectedSite, statusFilter]);

  // Refetch whenever the page becomes visible again (e.g. navigating back
  // from a detail page after a status update or payment) or the window
  // regains focus, so the table never shows stale payment statuses.
  useEffect(() => {
    const refetch = () => {
      const { selectedSite: site, statusFilter: status } = filtersRef.current;
      loadInvoices(site?.id, status);
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
      if (activeDateLabel) {
        if (dateMode === 'single' && singleDate) {
          result = result.filter((inv) => parseBackendDate(inv.invoiceDate) === singleDate);
        } else if (dateMode === 'range' && dateFrom && dateTo) {
          result = result.filter((inv) => {
            const d = parseBackendDate(inv.invoiceDate);
            return d !== '' && d >= dateFrom && d <= dateTo;
          });
        }
      }
      setFiltered(result);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, invoices, activeDateLabel, dateMode, singleDate, dateFrom, dateTo]);

  const toggleSiteDropdown = () => {
    setSiteOpen((p) => !p);
    setCalendarOpen(false);
  };

  const toggleCalendarDropdown = () => {
    setCalendarOpen((p) => !p);
    setSiteOpen(false);
  };

  const selectSite = (site: Site | null) => {
    setSelectedSite(site);
    setSiteOpen(false);
  };

  const applyDateFilter = () => {
    if (dateMode === 'single' && singleDate)
      setActiveDateLabel(`On ${singleDate}`);
    else if (dateMode === 'range' && dateFrom && dateTo)
      setActiveDateLabel(`${dateFrom} → ${dateTo}`);
    setCalendarOpen(false);
  };

  const clearDateFilter = () => {
    setSingleDate('');
    setDateFrom('');
    setDateTo('');
    setActiveDateLabel('');
    setCalendarOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedSite(null);
    setStatusFilter(null);
    clearDateFilter();
  };

  const hasActiveFilters = !!(selectedSite || activeDateLabel || statusFilter);

  return {
    calendarRef, siteRef, today,
    filtered, search, setSearch, isLoading, total, sites,
    selectedSite, selectSite, siteOpen, toggleSiteDropdown,
    calendarOpen, toggleCalendarDropdown, dateMode, setDateMode,
    singleDate, setSingleDate, dateFrom, setDateFrom, dateTo, setDateTo,
    activeDateLabel, applyDateFilter, clearDateFilter, clearAllFilters,
    statusFilter, setStatusFilter,
    hasActiveFilters,
  };
}