'use client';

import { useEffect, useState } from 'react';
import { FuelVehicleDetail, getDummyFuelVehicleDetail } from '@/types/fuel';

export function useFuelVehicleDetail(vehicleId: number) {
  const [vehicle, setVehicle] = useState<FuelVehicleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getDummyFuelVehicleDetail(vehicleId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setLoadError('Vehicle not found.');
        } else {
          setVehicle(data);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Failed to load fuel breakdown.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return { vehicle, isLoading, loadError };
}