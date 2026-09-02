'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from '@/types/external-work';

export function useExternalWorks() {
  const [motorVehicles, setMotorVehicles] = useState<MotorVehicleDelivery[]>([]);
  const [heavyMachinery, setHeavyMachinery] = useState<HeavyMachineryService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const items = await externalWorkService.list();
      const { motorVehicles: mv, heavyMachinery: hm } = splitExternalWork(items);
      setMotorVehicles(mv);
      setHeavyMachinery(hm);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load external works.'));
    } finally {
      if (!opts?.silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const addMotorVehicleDelivery = useCallback(async (form: AddMotorVehicleForm) => {
    try {
      await externalWorkService.create(toCreateMotorVehiclePayload(form));
      await fetchAll({ silent: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to add motor vehicle delivery.'));
    }
  }, [fetchAll]);

  const addHeavyMachineryService = useCallback(async (form: AddHeavyMachineryForm) => {
    try {
      await externalWorkService.create(toCreateHeavyMachineryPayload(form));
      await fetchAll({ silent: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to add heavy machinery service.'));
    }
  }, [fetchAll]);

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