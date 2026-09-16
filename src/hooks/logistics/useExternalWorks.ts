'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { externalWorkService } from '@/lib/api/external-work';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
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

export interface MotorVehicleDeliveryRow extends MotorVehicleDelivery {
  vehicleName: string;
  numberPlate: string;
}

export interface HeavyMachineryServiceRow extends HeavyMachineryService {
  vehicleName: string;
  numberPlate: string;
}

// Live-data hook: fetches from GET /external-work/all and splits the flat
// list into the two sections this page shows, then resolves each item's
// `transport_id` against the live transport list so the real vehicle name
// and number plate can be displayed.

export function useExternalWorks() {
  const { transports, isLoading: transportsLoading, loadError: transportsError } = useModesOfTransport();

  const [rawMotorVehicles, setRawMotorVehicles] = useState<MotorVehicleDelivery[]>([]);
  const [rawHeavyMachinery, setRawHeavyMachinery] = useState<HeavyMachineryService[]>([]);
  const [worksLoading, setWorksLoading] = useState(true);
  const [worksError, setWorksError] = useState<string | null>(null);

  // Guards against overlapping fetchAll calls (e.g. React Strict Mode's
  // dev-only double effect invocation) applying stale results out of order
  // — without this, an earlier/stray fetch can flip isLoading false with
  // empty data right before the real fetch finishes.
  const requestIdRef = useRef(0);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    const requestId = ++requestIdRef.current;
    if (!opts?.silent) setWorksLoading(true);
    setWorksError(null);
    try {
      const items = await externalWorkService.list();
      if (requestId !== requestIdRef.current) return; // a newer fetch has since started — ignore this one
      const { motorVehicles, heavyMachinery } = splitExternalWork(items);
      setRawMotorVehicles(motorVehicles);
      setRawHeavyMachinery(heavyMachinery);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setWorksError(getApiErrorMessage(err, 'Failed to load external works.'));
    } finally {
      if (requestId === requestIdRef.current && !opts?.silent) setWorksLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const resolveVehicle = useCallback(
    (transportId: number | null) => {
      const transport = transports.find((t) => t.id === transportId);
      return {
        vehicleName: transport?.name ?? 'Unknown Vehicle',
        numberPlate: transport?.number_plate ?? '—',
      };
    },
    [transports],
  );

  const motorVehicles: MotorVehicleDeliveryRow[] = useMemo(
    () => rawMotorVehicles.map((d) => ({ ...d, ...resolveVehicle(d.transportId) })),
    [rawMotorVehicles, resolveVehicle],
  );

  const heavyMachinery: HeavyMachineryServiceRow[] = useMemo(
    () => rawHeavyMachinery.map((s) => ({ ...s, ...resolveVehicle(s.transportId) })),
    [rawHeavyMachinery, resolveVehicle],
  );

  const addMotorVehicleDelivery = useCallback(async (form: AddMotorVehicleForm) => {
    try {
      const created = await externalWorkService.create(toCreateMotorVehiclePayload(form));
      setRawMotorVehicles((prev) => [toMotorVehicleDelivery(created), ...prev]);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to add motor vehicle delivery.'));
    }
  }, []);

  const addHeavyMachineryService = useCallback(async (form: AddHeavyMachineryForm) => {
    try {
      const created = await externalWorkService.create(toCreateHeavyMachineryPayload(form));
      setRawHeavyMachinery((prev) => [toHeavyMachineryService(created), ...prev]);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to add heavy machinery service.'));
    }
  }, []);

  return {
    motorVehicles,
    heavyMachinery,
    transports,
    isLoading: worksLoading || transportsLoading,
    loadError: worksError ?? transportsError,
    sectionLimit: EXTERNAL_WORKS_SECTION_LIMIT,
    refresh: fetchAll,
    addMotorVehicleDelivery,
    addHeavyMachineryService,
  };
}