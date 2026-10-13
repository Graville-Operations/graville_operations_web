'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useExternalWorks } from '@/hooks/logistics/useExternalWorks';
import { ROUTES } from '@/lib/routes';
import MotorVehiclesTable from '@/components/logistics/external-works/MotorVehiclesTable';
import HeavyMachineryTable from '@/components/logistics/external-works/HeavyMachineryTable';
import { EXTERNAL_WORK_ERROR_STYLE } from '@/components/logistics/external-works/ExternalWorkStatusBadge';

function ViewAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--primary)] hover:opacity-80 transition-opacity"
    >
      View all <ArrowRight size={13} />
    </Link>
  );
}

export default function ExternalWorksPage() {
  const {
    motorVehicles, heavyMachinery,
    motorVehicleTotal, heavyMachineryTotal,
    hasMoreMotorVehicles, hasMoreHeavyMachinery,
    isLoading, loadError,
  } = useExternalWorks();

  return (
    <div className="space-y-8">
      <div>
        <p className="gv-eyebrow">Logistics · Materials Delivery</p>
        <h1 className="text-2xl font-bold mt-1">External Works</h1>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={EXTERNAL_WORK_ERROR_STYLE}>
          <AlertTriangle size={15} className="shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Motor Vehicles</h2>
            {!isLoading && <span className="text-xs text-[color:var(--muted-foreground)]">({motorVehicleTotal})</span>}
          </div>
          {hasMoreMotorVehicles && <ViewAllLink href={ROUTES.logistics.deliveries.externalsMotorVehicles} />}
        </div>
        <MotorVehiclesTable deliveries={motorVehicles} isLoading={isLoading} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Heavy Machinery</h2>
            {!isLoading && <span className="text-xs text-[color:var(--muted-foreground)]">({heavyMachineryTotal})</span>}
          </div>
          {hasMoreHeavyMachinery && <ViewAllLink href={ROUTES.logistics.deliveries.externalsHeavyMachinery} />}
        </div>
        <HeavyMachineryTable services={heavyMachinery} isLoading={isLoading} />
      </section>
    </div>
  );
}