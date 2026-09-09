'use client';

import { useState, useEffect, useCallback } from 'react';
import { fuelService } from '@/lib/api/fuel-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { FuelVehicleSummary, FuelType } from '@/types/fuel';

const SEARCH_DEBOUNCE_MS = 300;

export function useFuelManagement() {
  const [vehicles, setVehicles] = useState<FuelVehicleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<FuelType | ''>('');

  const fetchVehicles = useCallback(async (params: { search: string; fuelType: FuelType | '' }) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await fuelService.listVehicleSummaries(params);
      setVehicles(list);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load fuel records.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(
      () => fetchVehicles({ search, fuelType: fuelTypeFilter }),
      search ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, fuelTypeFilter]);

  return {
    filteredVehicles: vehicles,
    isLoading,
    loadError,
    search,
    setSearch,
    fuelTypeFilter,
    setFuelTypeFilter,
    refresh: () => fetchVehicles({ search, fuelType: fuelTypeFilter }),
  };
}