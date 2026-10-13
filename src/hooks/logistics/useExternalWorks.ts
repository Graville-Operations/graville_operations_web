'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { externalWorkService } from '@/lib/api/external-work';
import { getApiErrorMessage } from '@/lib/api/api-error';
import {
  MotorVehicleDelivery,
  HeavyMachineryService,
  EXTERNAL_WORKS_SECTION_LIMIT,
  toMotorVehicleDelivery,
  toHeavyMachineryService,
} from '@/types/external-work';

export function useExternalWorks() {
  const [motorVehicles, setMotorVehicles] = useState<MotorVehicleDelivery[]>([]);
  const [heavyMachinery, setHeavyMachinery] = useState<HeavyMachineryService[]>([]);
  const [motorVehicleTotal, setMotorVehicleTotal] = useState(0);
  const [heavyMachineryTotal, setHeavyMachineryTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    const requestId = ++requestIdRef.current;
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const [vehicles, machinery] = await Promise.all([
        externalWorkService.listByType('vehicle', { limit: EXTERNAL_WORKS_SECTION_LIMIT }),
        externalWorkService.listByType('heavy_machinery', { limit: EXTERNAL_WORKS_SECTION_LIMIT }),
      ]);
      if (requestId !== requestIdRef.current) return;
      setMotorVehicles(vehicles.items.map(toMotorVehicleDelivery));
      setMotorVehicleTotal(vehicles.total);
      setHeavyMachinery(machinery.items.map(toHeavyMachineryService));
      setHeavyMachineryTotal(machinery.total);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setLoadError(getApiErrorMessage(err, 'Failed to load external works.'));
    } finally {
      if (requestId === requestIdRef.current && !opts?.silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return {
    motorVehicles,
    heavyMachinery,
    motorVehicleTotal,
    heavyMachineryTotal,
    hasMoreMotorVehicles: motorVehicleTotal > EXTERNAL_WORKS_SECTION_LIMIT,
    hasMoreHeavyMachinery: heavyMachineryTotal > EXTERNAL_WORKS_SECTION_LIMIT,
    isLoading,
    loadError,
    sectionLimit: EXTERNAL_WORKS_SECTION_LIMIT,
    refresh: fetchAll,
  };
}