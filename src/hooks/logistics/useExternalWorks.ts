'use client';

import { useState } from 'react';
import {
  MotorVehicleDelivery,
  HeavyMachineryService,
  EXTERNAL_WORKS_SECTION_LIMIT,
  getDummyMotorVehicleDeliveries,
  getDummyHeavyMachineryServices,
} from '@/types/external-work';

// DUMMY DATA HOOK — no backend yet. List-only view: seeds local state from
// static dummy generators and exposes it for display. Swap for a real
// fetch once the endpoints exist.

export function useExternalWorks() {
  const [motorVehicles] = useState<MotorVehicleDelivery[]>(getDummyMotorVehicleDeliveries());
  const [heavyMachinery] = useState<HeavyMachineryService[]>(getDummyHeavyMachineryServices());

  return {
    motorVehicles,
    heavyMachinery,
    sectionLimit: EXTERNAL_WORKS_SECTION_LIMIT,
  };
}