'use client';

import { useCallback, useEffect, useState } from 'react';
import { vehicleRepairsService } from '@/lib/api/vehicle-repairs';
import { VehicleRepair, VehicleRepairStatus } from '@/types/vehicle-repair';

export function useVehicleRepairs() {
  const [repairs, setRepairs] = useState<VehicleRepair[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleRepairStatus | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  // Search is server-side (matches number plate), so debounce keystrokes.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadRepairs = useCallback(() => {
    setLoading(true);
    vehicleRepairsService
      .listAll({
        status: statusFilter ?? undefined,
        search: debouncedSearch || undefined,
        start_date: dateRange.start,
        end_date: dateRange.end,
        skip: 0,
        limit: 100,
      })
      .then(({ items, total: count }) => {
        setRepairs(Array.isArray(items) ? items : []);
        setTotal(count);
      })
      .catch((err) => {
        console.error('[useVehicleRepairs] loadRepairs failed:', err);
        setRepairs([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [statusFilter, debouncedSearch, dateRange.start, dateRange.end]);

  useEffect(() => { loadRepairs(); }, [loadRepairs]);

  const applyDateFilter = useCallback((start: string, end: string) => {
    setDateRange({ start: start || undefined, end: end || undefined });
  }, []);
  const clearDateFilter = useCallback(() => setDateRange({}), []);

  const appliedLabel = dateRange.start && dateRange.end
    ? `${dateRange.start} → ${dateRange.end}`
    : (dateRange.start || dateRange.end || '');

  const hasFilter = !!(debouncedSearch || statusFilter || dateRange.start || dateRange.end);

  return {
    repairs,
    total,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    dateFrom: dateRange.start ?? '',
    dateTo: dateRange.end ?? '',
    appliedLabel, applyDateFilter, clearDateFilter,
    hasFilter,
    reload: loadRepairs,
  };
}