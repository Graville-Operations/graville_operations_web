'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { driverTasksService } from '@/lib/api/driver-tasks';
import { modesOfTransportService } from '@/lib/api/transport-service';
import { formatVehicleLabel } from '@/lib/utils/transfer-format';
import type { TransferRow } from '@/types/transfer';
import type { ModeOfTransport } from '@/types/transport';

export interface ResolvedAssignment {
  vehicleLabel: string;
  driverName: string;
}

export function useTransferAssignments() {
  const [taskTransportByTransfer, setTaskTransportByTransfer] = useState<Record<number, number>>({});
  const [modes, setModes] = useState<ModeOfTransport[]>([]);
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [tasksRes, modesRes] = await Promise.allSettled([
        driverTasksService.listAll({ limit: 100 }),
        modesOfTransportService.list(),
      ]);
      if (cancelled) return;

      if (tasksRes.status === 'fulfilled') {
        const map: Record<number, number> = {};
        tasksRes.value.items.forEach((t) => {
          if (t.material_transfer_id != null && t.transport_id != null) {
            map[t.material_transfer_id] = t.transport_id;
          }
        });
        setTaskTransportByTransfer(map);
      }
      if (modesRes.status === 'fulfilled') {
        setModes(modesRes.value);
      }
      setIsResolving(false);
    })();

    return () => { cancelled = true; };
  }, []);

  const modesById = useMemo(() => {
    const m = new Map<number, ModeOfTransport>();
    modes.forEach((mode) => m.set(mode.id, mode));
    return m;
  }, [modes]);

  const resolve = useCallback(
    (row: TransferRow): ResolvedAssignment => {
      const transportId = taskTransportByTransfer[row.id] ?? row.transportId ?? null;
      const mode = transportId != null ? modesById.get(transportId) : undefined;

      const vehicleLabel = mode
        ? formatVehicleLabel({
            id: mode.id,
            name: mode.name,
            numberPlate: mode.number_plate,
            driverId: mode.driver?.id ?? null,
          })
        : row.vehicleLabel;

      const d = mode?.driver;
      const driverName = d ? `${d.first_name} ${d.last_name}`.trim() : '';

      return { vehicleLabel, driverName };
    },
    [taskTransportByTransfer, modesById],
  );

  return { resolve, isResolving };
}