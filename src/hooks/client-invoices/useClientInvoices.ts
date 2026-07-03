'use client';

import { useState, useEffect, useRef } from 'react';
import { Site } from '@/types';
import { ClientInvoiceListItem, DateFilterMode } from '@/types/client-invoice';
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

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const { items, total: t } = await fetchClientInvoices(selectedSite?.id);
        setInvoices(items);
        setFiltered(items);
        setTotal(t);
      } catch (err) {
        console.error('[ClientInvoices]', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedSite]);

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
    clearDateFilter();
  };

  const hasActiveFilters = !!(selectedSite || activeDateLabel);

  return {
    calendarRef, siteRef, today,
    filtered, search, setSearch, isLoading, total, sites,
    selectedSite, selectSite, siteOpen, toggleSiteDropdown,
    calendarOpen, toggleCalendarDropdown, dateMode, setDateMode,
    singleDate, setSingleDate, dateFrom, setDateFrom, dateTo, setDateTo,
    activeDateLabel, applyDateFilter, clearDateFilter, clearAllFilters,
    hasActiveFilters,
  };
}