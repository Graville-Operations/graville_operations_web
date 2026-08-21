'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const [transportList, categoryList, driverList] = await Promise.all([
        modesOfTransportService.list(),
        vehicleCategoriesService.list(),
        driversService.list(),
      ]);
      const categoryNameById = new Map(categoryList.map((c) => [c.id, c.name]));
      setCategories(categoryList);
      setDrivers(driverList);
      setTransports(
        transportList.map((t) => ({ ...t, category_name: categoryNameById.get(t.category_id) })),
      );
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load modes of transport.'));
    } finally {
      if (!opts?.silent) setIsLoading(false);
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
  };
}