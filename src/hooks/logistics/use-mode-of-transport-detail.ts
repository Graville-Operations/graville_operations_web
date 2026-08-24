'use client';

import { useState, useEffect, useCallback } from 'react';
import { modesOfTransportService, vehicleCategoriesService, driversService } from '@/lib/api/transport-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ApiUser } from '@/types/users';
import { ModeOfTransport, VehicleCategory } from '@/types/transport';
import { readTransportPreview, clearTransportPreview } from '@/lib/utils/transport-preview';

export function useModeOfTransportDetail(transportId: number) {
  const [transport, setTransport] = useState<ModeOfTransport | null>(null);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [drivers, setDrivers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    setDetailLoading(true);
    setLoadError(null);
    try {
      const [transportList, categoryList, driverList] = await Promise.all([
        modesOfTransportService.list(),
        vehicleCategoriesService.list(),
        driversService.list(),
      ]);
      const found = transportList.find((t) => t.id === transportId) ?? null;
      setCategories(categoryList);
      setDrivers(driverList);
      setTransport(found);
      if (!found) setLoadError('Vehicle not found.');
      clearTransportPreview(transportId);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load vehicle.'));
    } finally {
      setIsLoading(false);
      setDetailLoading(false);
    }
  }, [transportId]);

  useEffect(() => {
    // Hydrate instantly from whatever the list screen already had for this vehicle,
    // so the detail screen doesn't have to wait on a network round trip to render.
    const cached = readTransportPreview(transportId);
    if (cached && cached.id === transportId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransport(cached);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll({ silent: !!cached });
  }, [transportId, fetchAll]);

  const categoryName = categories.find((c) => c.id === transport?.category_id)?.name ?? transport?.category_name;

  const runAction = useCallback(async (action: () => Promise<ModeOfTransport>) => {
    setActionError(null);
    setIsSaving(true);
    try {
      const updated = await action();
      setTransport(updated);
      return updated;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update vehicle.');
      setActionError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateNumberPlate = useCallback((numberPlate: string) => {
    if (!transport) return Promise.reject(new Error('Vehicle not loaded.'));
    return runAction(() => modesOfTransportService.update(transport.id, { number_plate: numberPlate }));
  }, [transport, runAction]);

  const updateDriver = useCallback((driverId: number) => {
    if (!transport) return Promise.reject(new Error('Vehicle not loaded.'));
    return runAction(() => modesOfTransportService.update(transport.id, { driver_id: driverId }));
  }, [transport, runAction]);

  const toggleActive = useCallback((isActive: boolean) => {
    if (!transport) return Promise.reject(new Error('Vehicle not loaded.'));
    return runAction(() => modesOfTransportService.update(transport.id, { is_active: isActive }));
  }, [transport, runAction]);

  const unassignDriver = useCallback(() => {
    if (!transport) return Promise.reject(new Error('Vehicle not loaded.'));
    return runAction(() => modesOfTransportService.unassignDriver(transport.id));
  }, [transport, runAction]);

  return {
    transport,
    categoryName,
    drivers,
    isLoading,
    detailLoading,
    loadError,
    actionError,
    isSaving,
    updateNumberPlate,
    updateDriver,
    toggleActive,
    unassignDriver,
    refresh: fetchAll,
  };
}