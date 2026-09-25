'use client';

import { useState, useEffect } from 'react';
import { fetchUsers } from '@/lib/api/users';
import { fetchRecentClientInvoices } from '@/lib/api/client-invoices';
import { fetchOverviewKPIs } from '@/lib/api/sites';
import { fetchInvoiceSummary } from '@/lib/api/invoices';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';
import { ApiUser } from '@/types/users';
import { ClientInvoiceListItem } from '@/types/client-invoice';
import { OverviewKPIs } from '@/types/site';
import { InvoiceSummaryItem } from '@/types/invoice-summary';

export function useHomeDashboard() {
  const [users, setUsers] = useState<ApiUser[]>(
    () => readEntityCache<ApiUser[]>(ENTITY_CACHE_KEYS.users) ?? [],
  );
  const [usersLoading, setUsersLoading] = useState<boolean>(
    () => readEntityCache<ApiUser[]>(ENTITY_CACHE_KEYS.users) === null,
  );
  const recentUsers = users.slice(0, 5);

  const [recentInvoices, setRecentInvoices] = useState<ClientInvoiceListItem[]>(
    () => readEntityCache<ClientInvoiceListItem[]>(ENTITY_CACHE_KEYS.recentClientInvoices) ?? [],
  );
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(
    () => readEntityCache<ClientInvoiceListItem[]>(ENTITY_CACHE_KEYS.recentClientInvoices) === null,
  );

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummaryItem[]>([]);
  const [invoiceSummaryLoading, setInvoiceSummaryLoading] = useState(true);

  useEffect(() => {
    fetchOverviewKPIs()
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setKpisLoading(false));

    fetchInvoiceSummary()
      .then((res) => setInvoiceSummary(res))
      .catch(() => setInvoiceSummary([]))
      .finally(() => setInvoiceSummaryLoading(false));

    fetchUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setUsersLoading(false));

    fetchRecentClientInvoices()
      .then(setRecentInvoices)
      .catch(console.error)
      .finally(() => setInvoicesLoading(false));
  }, []);

  return {
    recentUsers, usersLoading,
    recentInvoices, invoicesLoading,
    kpis, kpisLoading,
    invoiceSummary, invoiceSummaryLoading,
  };
}