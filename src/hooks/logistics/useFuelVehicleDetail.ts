'use client';

import { useState, useEffect, useCallback } from 'react';
import { fuelService } from '@/lib/api/fuel-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { FuelVehicleDetail } from '@/types/fuel';

export function useFuelVehicleDetail(vehicleId: number) {
  const [vehicle, setVehicle] = useState<FuelVehicleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async (opts?: { silent?: boolean }) => {
    if (!vehicleId) return;
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fuelService.getVehicleDetail(vehicleId);
      setVehicle(data);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load fuel breakdown.'));
    } finally {
      if (!opts?.silent) setIsLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicle();
  }, [fetchVehicle]);

  return { vehicle, isLoading, loadError, refresh: fetchVehicle };
}