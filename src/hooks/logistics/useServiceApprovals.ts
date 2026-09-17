'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { vehicleServicesService } from '@/lib/api/vehicle-services';
import { VehicleService, ServiceRequestActionPayload } from '@/types/vehicle-service';

export function useServiceApprovals() {
  const [requests, setRequests] = useState<VehicleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<VehicleService | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadRequests = useCallback(() => {
    setLoading(true);
    vehicleServicesService
      .listAwaitingApproval({ skip: 0, limit: 100 })
      .then(({ items }) => setRequests(Array.isArray(items) ? items : []))
      .catch((err) => {
        console.error('[useServiceApprovals] loadRequests failed:', err);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => r.vehicle.toLowerCase().includes(q) || r.number_plate.toLowerCase().includes(q));
  }, [requests, search]);

  const openDetail = useCallback((service: VehicleService) => {
    setSelected(service); // show list data immediately, then refresh with full detail
    setDetailLoading(true);
    vehicleServicesService
      .getDetail(service.id)
      .then((full) => setSelected(full))
      .catch((err) => {
        console.error('[useServiceApprovals] getDetail failed:', err);
      })
      .finally(() => setDetailLoading(false));
  }, []);

  const closeDetail = () => setSelected(null);

  const submitAction = useCallback(async (id: number, payload: ServiceRequestActionPayload) => {
    try {
      await vehicleServicesService.action(id, payload);
      closeDetail();
      loadRequests();
    } catch (err) {
      console.error('[useServiceApprovals] submitAction failed:', err);
      throw err;
    }
  }, [loadRequests]);

  return {
    requests: filtered,
    loading,
    search, setSearch,
    selected, detailLoading, openDetail, closeDetail,
    submitAction,
    hasFilter: !!search,
  };
}