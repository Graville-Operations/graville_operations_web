'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { modesOfTransportService, vehicleCategoriesService } from '@/lib/api/transport-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import { ApiUser } from '@/types/users';
import {
  ModeOfTransport,
  VehicleCategory,
  CreateModeOfTransportPayload,
  UpdateModeOfTransportPayload,
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
      const [transportList, categoryList, usersRes] = await Promise.all([
        modesOfTransportService.list(),
        vehicleCategoriesService.list(),
        api.get(API.users.list, { params: { limit: 100, skip: 0 } }),
      ]);
      const categoryNameById = new Map(categoryList.map((c) => [c.id, c.name]));
      setCategories(categoryList);
      setTransports(
        transportList.map((t) => ({ ...t, category_name: categoryNameById.get(t.category_id) })),
      );

      const users = unwrapArray<ApiUser>(usersRes.data);
      // Prefer users whose role looks like a driver; fall back to the full
      // active user list so the dropdown is never empty just because no
      // "Driver" role has been set up yet.
      const driverRoleUsers = users.filter((u) => (u.role ?? '').toLowerCase().includes('driver'));
      setDrivers(driverRoleUsers.length > 0 ? driverRoleUsers : users);
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

  const updateTransport = useCallback(async (id: number, payload: UpdateModeOfTransportPayload) => {
    try {
      await modesOfTransportService.update(id, payload);
      await fetchAll({ silent: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to update mode of transport.'));
    }
  }, [fetchAll]);

  const filtered = useMemo(
    () => transports.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.number_plate.toLowerCase().includes(search.toLowerCase()) ||
      (t.driver_name ?? '').toLowerCase().includes(search.toLowerCase()),
    ),
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
    updateTransport,
    refresh: fetchAll,
  };
}