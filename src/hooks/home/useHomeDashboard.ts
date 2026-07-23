'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { useInvoiceStore } from '@/store/invoice-store';
import api from '@/lib/api';
import { fetchOverviewKPIs } from '@/lib/api/sites';
import { fetchInvoiceSummary } from '@/lib/api/invoices';
import { OverviewKPIs } from '@/types/site';
import { InvoiceSummaryItem } from '@/types/invoice-summary';
import { API } from '@/lib/endpoints';

export function useHomeDashboard() {
  const { users, isLoaded: usersLoaded, setUsers } = useUserStore();
  const [usersLoading, setUsersLoading] = useState(!usersLoaded);
  const recentUsers = users.slice(0, 5);

  const { invoices, isLoaded: invoicesLoaded, startPolling } = useInvoiceStore();
  const [invoicesLoading, setInvoicesLoading] = useState(!invoicesLoaded);
  const recentInvoices = invoices.slice(0, 5);

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummaryItem[]>([]);
  const [invoiceSummaryLoading, setInvoiceSummaryLoading] = useState(true);

  useEffect(() => {
    const stopPolling = startPolling();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvoicesLoading(false);
    return () => stopPolling();
  }, [startPolling]);

  useEffect(() => {
    fetchOverviewKPIs()
      .then((res) => {
        const kpiData = (res as unknown as { data?: OverviewKPIs }).data ?? res;
        setKpis(kpiData as OverviewKPIs);
      })
      .catch(() => setKpis(null))
      .finally(() => setKpisLoading(false));

    fetchInvoiceSummary()
      .then((res) => setInvoiceSummary(res))
      .catch(() => setInvoiceSummary([]))
      .finally(() => setInvoiceSummaryLoading(false));

    if (!usersLoaded) {
      api.get(API.users.list)
        .then(({ data }) => {
          const payload = data?.data ?? data;
          const list = Array.isArray(payload) ? payload : payload?.items ?? [];
          setUsers(list);
        })
        .catch(console.error)
        .finally(() => setUsersLoading(false));
    }
  }, [setUsers, usersLoaded]);

  return {
    recentUsers, usersLoading,
    recentInvoices, invoicesLoading,
    kpis, kpisLoading,
    invoiceSummary, invoiceSummaryLoading,
  };
}