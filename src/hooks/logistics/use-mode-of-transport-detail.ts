'use client';

import { useState, useEffect, useCallback } from 'react';
import { modesOfTransportService, vehicleCategoriesService, driversService } from '@/lib/api/transport-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ApiUser } from '@/types/users';
import { ModeOfTransport, VehicleCategory } from '@/types/transport';

export function useModeOfTransportDetail(transportId: number) {
  const [transport, setTransport] = useState<ModeOfTransport | null>(null);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [drivers, setDrivers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
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
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load vehicle.'));
    } finally {
      setIsLoading(false);
    }
  }, [transportId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const categoryName = categories.find((c) => c.id === transport?.category_id)?.name;

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