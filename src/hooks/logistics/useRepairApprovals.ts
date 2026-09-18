'use client';

import { useCallback, useEffect, useState } from 'react';
import { vehicleRepairsService } from '@/lib/api/vehicle-repairs';
import { VehicleRepair, RepairActionPayload } from '@/types/vehicle-repair';

export function useRepairApprovals() {
  const [requests, setRequests] = useState<VehicleRepair[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selected, setSelected] = useState<VehicleRepair | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadRequests = useCallback(() => {
    setLoading(true);
    vehicleRepairsService
      .listAwaitingApproval({ search: debouncedSearch || undefined, skip: 0, limit: 100 })
      .then(({ items }) => setRequests(Array.isArray(items) ? items : []))
      .catch((err) => {
        console.error('[useRepairApprovals] loadRequests failed:', err);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const openDetail = useCallback((repair: VehicleRepair) => {
    setSelected(repair); // show list data immediately, then refresh with full detail
    setDetailLoading(true);
    vehicleRepairsService
      .getAwaitingApprovalDetail(repair.id)
      .then((full) => setSelected(full))
      .catch((err) => console.error('[useRepairApprovals] getAwaitingApprovalDetail failed:', err))
      .finally(() => setDetailLoading(false));
  }, []);

  const closeDetail = () => setSelected(null);

  const submitAction = useCallback(async (id: number, payload: RepairActionPayload) => {
    try {
      await vehicleRepairsService.action(id, payload);
      closeDetail();
      loadRequests();
    } catch (err) {
      console.error('[useRepairApprovals] submitAction failed:', err);
      throw err;
    }
  }, [loadRequests]);

  return {
    requests,
    loading,
    search, setSearch,
    selected, detailLoading, openDetail, closeDetail,
    submitAction,
    hasFilter: !!debouncedSearch,
  };
}