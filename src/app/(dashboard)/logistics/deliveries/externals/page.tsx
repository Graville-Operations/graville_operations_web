'use client';

import { AlertTriangle } from 'lucide-react';
import { useExternalWorks } from '@/hooks/logistics/useExternalWorks';
import MotorVehiclesTable from '@/components/logistics/external-works/MotorVehiclesTable';
import HeavyMachineryTable from '@/components/logistics/external-works/HeavyMachineryTable';

export default function ExternalWorksPage() {
  const { motorVehicles, heavyMachinery, isLoading, loadError, sectionLimit } = useExternalWorks();

  return (
    <div className="space-y-8">
      <div>
        <p className="gv-eyebrow">Logistics · Materials Delivery</p>
        <h1 className="text-2xl font-bold mt-1">External Works</h1>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
          <AlertTriangle size={15} className="shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Motor Vehicles</h2>
          <span className="text-xs text-[color:var(--muted-foreground)]">({motorVehicles.length}/{sectionLimit})</span>
        </div>
        <MotorVehiclesTable deliveries={motorVehicles} isLoading={isLoading} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Heavy Machinery</h2>
          <span className="text-xs text-[color:var(--muted-foreground)]">({heavyMachinery.length}/{sectionLimit})</span>
        </div>
        <HeavyMachineryTable services={heavyMachinery} isLoading={isLoading} />
      </section>
    </div>
  );
}