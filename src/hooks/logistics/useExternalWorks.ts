'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { externalWorkService } from '@/lib/api/external-work';
import { getApiErrorMessage } from '@/lib/api/api-error';
import {
  MotorVehicleDelivery,
  HeavyMachineryService,
  AddMotorVehicleForm,
  AddHeavyMachineryForm,
  EXTERNAL_WORKS_SECTION_LIMIT,
  splitExternalWork,
  toCreateMotorVehiclePayload,
  toCreateHeavyMachineryPayload,
  toMotorVehicleDelivery,
  toHeavyMachineryService,
} from '@/types/external-work';

export function useExternalWorks() {
  const [motorVehicles, setMotorVehicles] = useState<MotorVehicleDelivery[]>([]);
  const [heavyMachinery, setHeavyMachinery] = useState<HeavyMachineryService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    const requestId = ++requestIdRef.current;
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const items = await externalWorkService.list();
      if (requestId !== requestIdRef.current) return;
      const { motorVehicles: mv, heavyMachinery: hm } = splitExternalWork(items);
      setMotorVehicles(mv);
      setHeavyMachinery(hm);
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

  const addMotorVehicleDelivery = useCallback(async (form: AddMotorVehicleForm) => {
    try {
      const created = await externalWorkService.create(toCreateMotorVehiclePayload(form));
      setMotorVehicles((prev) => [toMotorVehicleDelivery(created), ...prev]);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to add motor vehicle delivery.'));
    }
  }, []);

  const addHeavyMachineryService = useCallback(async (form: AddHeavyMachineryForm) => {
    try {
      const created = await externalWorkService.create(toCreateHeavyMachineryPayload(form));
      setHeavyMachinery((prev) => [toHeavyMachineryService(created), ...prev]);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to add heavy machinery service.'));
    }
  }, []);

  return {
    motorVehicles,
    heavyMachinery,
    isLoading,
    loadError,
    sectionLimit: EXTERNAL_WORKS_SECTION_LIMIT,
    refresh: fetchAll,
    addMotorVehicleDelivery,
    addHeavyMachineryService,
  };
}