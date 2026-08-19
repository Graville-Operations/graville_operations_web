'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { modesOfTransportService, vehicleCategoriesService } from '@/lib/api/transport-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import {
  ModeOfTransport,
  VehicleCategory,
  CreateModeOfTransportPayload,
  UpdateModeOfTransportPayload,
  ToastState,
} from '@/types/transport';

export function useModesOfTransport() {
  const [transports, setTransports] = useState<ModeOfTransport[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const [transportList, categoryList] = await Promise.all([
        modesOfTransportService.list(),
        vehicleCategoriesService.list(),
      ]);
      const categoryNameById = new Map(categoryList.map((c) => [c.id, c.name]));
      setCategories(categoryList);
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
      showToast('Mode of transport created successfully!', 'success');
      await fetchAll({ silent: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create mode of transport.'));
    }
  }, [fetchAll, showToast]);

  const updateTransport = useCallback(async (id: number, payload: UpdateModeOfTransportPayload) => {
    try {
      await modesOfTransportService.update(id, payload);
      showToast('Mode of transport updated successfully!', 'success');
      await fetchAll({ silent: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to update mode of transport.'));
    }
  }, [fetchAll, showToast]);

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
    isLoading,
    loadError,
    toast,
    search,
    setSearch,
    createTransport,
    updateTransport,
    refresh: fetchAll,
  };
}