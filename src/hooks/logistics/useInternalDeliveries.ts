'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DeliveryStatus,
  MaterialDelivery,
  InitiateDeliveryForm,
  getDummyInternalDeliveries,
} from '@/types/material-delivery';

// DUMMY DATA HOOK — no backend yet. Everything here operates on local
// React state seeded from `getDummyInternalDeliveries()`. Once the real
// endpoints exist, this becomes a normal fetch-backed hook (see the
// invoice/permit/site hooks for the pattern) — the page component below
// shouldn't need to change.

function formatDateLabel(start?: string, end?: string): string {
  if (start && end) return start === end ? start : `${start} → ${end}`;
  return start || end || '';
}

export function useInternalDeliveries() {
  const [deliveries, setDeliveries] = useState<MaterialDelivery[]>(getDummyInternalDeliveries());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [showInitiateModal, setShowInitiateModal] = useState(false);

  const appliedLabel = formatDateLabel(dateRange.start, dateRange.end);

  const totalDeliveries = deliveries.length;
  const inTransitCount = useMemo(
    () => deliveries.filter((d) => d.status === DeliveryStatus.IN_TRANSIT).length,
    [deliveries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deliveries.filter((d) => {
      const matchesSearch =
        !q ||
        d.material.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q) ||
        d.pickupPoint.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || d.status === statusFilter;
      const matchesDate =
        (!dateRange.start || d.date >= dateRange.start) &&
        (!dateRange.end || d.date <= dateRange.end);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [deliveries, search, statusFilter, dateRange]);

  const applyDateFilter = useCallback((start: string, end: string) => {
    setDateRange({ start: start || undefined, end: end || undefined });
  }, []);

  const clearDateFilter = useCallback(() => setDateRange({}), []);

  const openInitiateModal = () => setShowInitiateModal(true);
  const closeInitiateModal = () => setShowInitiateModal(false);

  const initiateDelivery = useCallback((form: InitiateDeliveryForm) => {
    setDeliveries((prev) => [
      {
        id: (prev.at(-1)?.id ?? 0) + 1,
        material: 'Not specified',
        quantity: '—',
        pickupPoint: 'Central Store — Industrial Area',
        destination: form.destination,
        status: DeliveryStatus.PENDING,
        date: new Date().toISOString().slice(0, 10),
        driver: form.driver || null,
        purpose: form.purpose,
      },
      ...prev,
    ]);
    setShowInitiateModal(false);
  }, []);

  const hasFilter = !!(search || statusFilter || appliedLabel);

  return {
    deliveries: filtered,
    totalDeliveries,
    inTransitCount,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom: dateRange.start ?? '',
    dateTo: dateRange.end ?? '',
    appliedLabel,
    applyDateFilter,
    clearDateFilter,
    hasFilter,
    showInitiateModal,
    openInitiateModal,
    closeInitiateModal,
    initiateDelivery,
  };
}