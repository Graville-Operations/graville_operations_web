'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { modesOfTransportService, vehicleCategoriesService, driversService } from '@/lib/api/transport-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ApiUser } from '@/types/users';
import {
  ModeOfTransport,
  VehicleCategory,
  CreateModeOfTransportPayload,
} from '@/types/transport';

export function useModesOfTransport() {
  const [transports, setTransports] = useState<ModeOfTransport[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [drivers, setDrivers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Guards against overlapping fetchAll calls (e.g. React Strict Mode's
  // dev-only double effect invocation) applying stale results out of order.
  const requestIdRef = useRef(0);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    const requestId = ++requestIdRef.current;
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const [transportList, categoryList, driverList] = await Promise.all([
        modesOfTransportService.list(),
        vehicleCategoriesService.list(),
        driversService.list(),
      ]);
      if (requestId !== requestIdRef.current) return; // a newer fetch has since started — ignore this one
      const categoryNameById = new Map(categoryList.map((c) => [c.id, c.name]));
      setCategories(categoryList);
      setDrivers(driverList);
      setTransports(
        transportList.map((t) => ({ ...t, category_name: categoryNameById.get(t.category_id) })),
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setLoadError(getApiErrorMessage(err, 'Failed to load modes of transport.'));
    } finally {
      if (requestId === requestIdRef.current && !opts?.silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const createTransport = useCallback(async (payload: CreateModeOfTransportPayload) => {
    if (!payload.category_id) {
      throw new Error('Vehicle category is required.');
    }
    if (!payload.number_plate.trim()) {
      throw new Error('Number plate is required.');
    }
    try {
      await modesOfTransportService.create(payload);
      await fetchAll({ silent: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create mode of transport.'));
    }
  }, [fetchAll]);

  const applyUpdatedTransport = useCallback((updated: ModeOfTransport) => {
    setTransports((prev) => {
      const category = categories.find((c) => c.id === updated.category_id);
      return prev.map((t) => (t.id === updated.id ? { ...updated, category_name: category?.name } : t));
    });
  }, [categories]);

  const runRowAction = useCallback(async (id: number, action: () => Promise<ModeOfTransport>) => {
    setActionError(null);
    setSavingId(id);
    try {
      const updated = await action();
      applyUpdatedTransport(updated);
      return updated;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update vehicle.');
      setActionError(message);
      throw new Error(message);
    } finally {
      setSavingId(null);
    }
  }, [applyUpdatedTransport]);

  const updateNumberPlate = useCallback((id: number, numberPlate: string) => {
    return runRowAction(id, () => modesOfTransportService.update(id, { number_plate: numberPlate }));
  }, [runRowAction]);

  const updateDriver = useCallback((id: number, driverId: number) => {
    return runRowAction(id, () => modesOfTransportService.update(id, { driver_id: driverId }));
  }, [runRowAction]);

  const unassignDriver = useCallback((id: number) => {
    return runRowAction(id, () => modesOfTransportService.unassignDriver(id));
  }, [runRowAction]);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const toggleActive = useCallback(async (id: number, isActive: boolean) => {
    setActionError(null);
    setTogglingId(id);
    try {
      const updated = await modesOfTransportService.update(id, { is_active: isActive });
      applyUpdatedTransport(updated);
      return updated;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update vehicle status.');
      setActionError(message);
      throw new Error(message);
    } finally {
      setTogglingId(null);
    }
  }, [applyUpdatedTransport]);

  const filtered = useMemo(
    () => transports.filter((t) => {
      const q = search.toLowerCase();
      const driverName = t.driver ? `${t.driver.first_name} ${t.driver.last_name}` : '';
      return (
        t.name.toLowerCase().includes(q) ||
        t.number_plate.toLowerCase().includes(q) ||
        driverName.toLowerCase().includes(q)
      );
    }),
    [transports, search],
  );

  return {
    transports,
    filtered,
    categories,
    drivers,
    isLoading,
    loadError,
    search,
    setSearch,
    createTransport,
    refresh: fetchAll,
    savingId,
    togglingId,
    actionError,
    setActionError,
    updateNumberPlate,
    updateDriver,
    unassignDriver,
    toggleActive,
  };
}