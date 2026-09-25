'use client';

import { useEffect, useMemo, useState } from 'react';
import { driverTasksService } from '@/lib/api/driver-tasks';
import { modesOfTransportService } from '@/lib/api/transport-service';
import { formatVehicleLabel } from '@/lib/utils/transfer-format';
import type { TransferDetail } from '@/types/transfer';
import type { ModeOfTransport } from '@/types/transport';

export interface TransferAssignment {
  vehicleLabel: string;
  driver: { name: string; phone: string | null } | null;
  isResolving: boolean;
}

export function useTransferAssignment(
  transferId: number,
  transfer: TransferDetail | null,
): TransferAssignment {
  const hasTransfer = !!transfer;
  const [taskTransportId, setTaskTransportId] = useState<number | null>(null);
  const [modes, setModes] = useState<ModeOfTransport[]>([]);
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    if (!hasTransfer || !Number.isFinite(transferId)) return;
    let cancelled = false;

    (async () => {
      const [tasksRes, modesRes] = await Promise.allSettled([
        driverTasksService.listAll({ limit: 100 }),
        modesOfTransportService.list(),
      ]);
      if (cancelled) return;

      if (tasksRes.status === 'fulfilled') {
        const task = tasksRes.value.items.find(
          (t) => t.material_transfer_id === transferId && t.transport_id != null,
        );
        setTaskTransportId(task?.transport_id ?? null);
      }
      if (modesRes.status === 'fulfilled') {
        setModes(modesRes.value);
      }
      setIsResolving(false);
    })();

    return () => { cancelled = true; };
  }, [transferId, hasTransfer]);

  return useMemo(() => {
    const transportId = taskTransportId ?? transfer?.transport?.id ?? null;
    if (transportId == null) {
      return { vehicleLabel: '', driver: null, isResolving };
    }

    const mode = modes.find((m) => m.id === transportId);
    const vehicleLabel = mode
      ? formatVehicleLabel({
          id: mode.id,
          name: mode.name,
          numberPlate: mode.number_plate,
          driverId: mode.driver?.id ?? null,
        })
      : formatVehicleLabel(transfer?.transport);

    const d = mode?.driver;
    const driver = d
      ? { name: `${d.first_name} ${d.last_name}`.trim(), phone: d.phone_no ?? null }
      : null;

    return { vehicleLabel, driver, isResolving };
  }, [taskTransportId, modes, transfer, isResolving]);
}