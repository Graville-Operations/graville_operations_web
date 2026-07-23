'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  fetchSubcontractorInvoices,
  fetchSubcontractorInvoiceDetail,
} from '@/lib/api/subcontractor-invoices';
import { fetchSites } from '@/lib/api/sites';
import type { SubcontractorInvoiceListItem, SiteOption } from '@/types/subcontractor-invoice';

export type DateMode = 'single' | 'range';

export function useSubcontractorInvoices() {
  const [invoices, setInvoices] = useState<SubcontractorInvoiceListItem[]>([]);
  const [filtered, setFiltered] = useState<SubcontractorInvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [sites, setSites] = useState<SiteOption[]>([]);
  const [siteFilter, setSiteFilter] = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  const [search, setSearch] = useState('');

  const [dateMode, setDateMode] = useState<DateMode>('single');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  useEffect(() => {
    fetchSites()
      .then((siteList) => setSites(siteList.map((s) => ({ id: s.id, name: s.name }))))
      .catch((err) => console.error('[Sites] fetch error:', err));
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const { items: list, total: fetchedTotal } = await fetchSubcontractorInvoices({
        siteId: siteFilter || undefined,
        paymentStatus: statusFilter || undefined,
      });
      setTotal(fetchedTotal);

      const needsHydration = list.length > 0 && !list[0].createdBy;
      if (needsHydration) {
        const hydrated = await hydrateCreatedBy(list);
        setInvoices(hydrated);
        setFiltered(hydrated);
      } else {
        setInvoices(list);
        setFiltered(list);
      }
    } catch (err) {
      console.error('[SubcontractorInvoices] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      let result = invoices;

      if (q) {
        result = result.filter(
          (inv) =>
            inv.invoiceNo.toLowerCase().includes(q) ||
            inv.contractorName.toLowerCase().includes(q),
        );
      }

      if (dateMode === 'single' && dateFilter) {
        result = result.filter((inv) => inv.invoiceDate.startsWith(dateFilter));
      }

      if (dateMode === 'range' && (dateFrom || dateTo)) {
        const from = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : 0;
        const to = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : Infinity;
        result = result.filter((inv) => {
          const cleaned = inv.invoiceDate.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
          const t = new Date(cleaned).getTime();
          if (isNaN(t)) return true;
          return t >= from && t <= to;
        });
      }

      setFiltered(result);
    }, 150);

    return () => clearTimeout(timer);
  }, [search, dateFilter, dateFrom, dateTo, dateMode, invoices]);

  const clearDateFilter = () => {
    setDateFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const clearAllFilters = () => {
    setSearch('');
    clearDateFilter();
    setSiteFilter('');
    setStatusFilter('');
  };

  const hasDateFilter = dateMode === 'single' ? !!dateFilter : !!(dateFrom || dateTo);
  const hasFilters = useMemo(
    () => !!(search || hasDateFilter || siteFilter || statusFilter),
    [search, hasDateFilter, siteFilter, statusFilter],
  );

  return {
    filtered,
    isLoading,
    total,
    sites,

    search,
    setSearch,
    siteFilter,
    setSiteFilter,
    statusFilter,
    setStatusFilter,
    dateMode,
    setDateMode,
    dateFilter,
    setDateFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    hasDateFilter,
    hasFilters,
    clearDateFilter,
    clearAllFilters,

    refetch: loadInvoices,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetches one invoice's detail (for its createdBy) with a couple of retries
// on failure — a dropped request from a flaky connection shouldn't
// permanently leave a real submitter looking blank in the table.
async function fetchCreatedByWithRetry(
  invoiceId: number,
  attempts = 3,
): Promise<{ id: number; createdBy?: SubcontractorInvoiceListItem['createdBy'] }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const detail = await fetchSubcontractorInvoiceDetail(invoiceId);
      return { id: invoiceId, createdBy: detail.createdBy };
    } catch (err) {
      lastErr = err;
      if (attempt < attempts - 1) {
        await delay(400 * (attempt + 1)); // 400ms, then 800ms
      }
    }
  }
  console.error(`[SubcontractorInvoices] createdBy hydration failed for invoice ${invoiceId} after ${attempts} attempts:`, lastErr);
  return { id: invoiceId, createdBy: undefined };
}

async function hydrateCreatedBy(
  list: SubcontractorInvoiceListItem[],
): Promise<SubcontractorInvoiceListItem[]> {
  const CHUNK = 10;
  const hydrated = [...list];

  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const results = await Promise.allSettled(
      chunk.map((inv) => fetchCreatedByWithRetry(inv.id)),
    );
    results.forEach((res) => {
      if (res.status === 'fulfilled' && res.value.createdBy) {
        const idx = hydrated.findIndex((h) => h.id === res.value.id);
        if (idx !== -1) hydrated[idx] = { ...hydrated[idx], createdBy: res.value.createdBy };
      }
    });
  }

  return hydrated;
}