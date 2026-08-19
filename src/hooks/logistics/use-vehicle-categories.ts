'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vehicleCategoriesService } from '@/lib/api/transport-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import {
  VehicleCategory,
  CreateVehicleCategoryPayload,
  UpdateVehicleCategoryPayload,
  ToastState,
} from '@/types/transport';

export function useVehicleCategories() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await vehicleCategoriesService.list();
      setCategories(list);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load vehicle categories.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (payload: CreateVehicleCategoryPayload) => {
    if (!payload.name.trim()) {
      throw new Error('Category name is required.');
    }
    try {
      await vehicleCategoriesService.create(payload);
      showToast('Vehicle category created successfully!', 'success');
      await fetchCategories();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create vehicle category.'));
    }
  }, [fetchCategories, showToast]);

  const updateCategory = useCallback(async (id: number, payload: UpdateVehicleCategoryPayload) => {
    try {
      await vehicleCategoriesService.update(id, payload);
      showToast('Vehicle category updated successfully!', 'success');
      await fetchCategories();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to update vehicle category.'));
    }
  }, [fetchCategories, showToast]);

  const filtered = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  return {
    categories,
    filtered,
    isLoading,
    loadError,
    toast,
    search,
    setSearch,
    createCategory,
    updateCategory,
    refresh: fetchCategories,
  };
}