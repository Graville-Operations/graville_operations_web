'use client';

import { useExternalWorks } from '@/hooks/logistics/useExternalWorks';
import MotorVehiclesTable from '@/components/logistics/external-works/MotorVehiclesTable';
import HeavyMachineryTable from '@/components/logistics/external-works/HeavyMachineryTable';

export default function ExternalWorksPage() {
  const { motorVehicles, heavyMachinery, sectionLimit } = useExternalWorks();

  return (
    <div className="space-y-8">
      <div>
        <p className="gv-eyebrow">Logistics · Materials Delivery</p>
        <h1 className="text-2xl font-bold mt-1">External Works</h1>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Motor Vehicles</h2>
          <span className="text-xs text-[color:var(--muted-foreground)]">({motorVehicles.length}/{sectionLimit})</span>
        </div>
        <MotorVehiclesTable deliveries={motorVehicles} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Heavy Machinery</h2>
          <span className="text-xs text-[color:var(--muted-foreground)]">({heavyMachinery.length}/{sectionLimit})</span>
        </div>
        <HeavyMachineryTable services={heavyMachinery} />
      </section>
    </div>
  );
}