'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExternalWorkList } from '@/hooks/logistics/useExternalWorkList';
import { ExternalWorkType, toMotorVehicleDelivery, toHeavyMachineryService } from '@/types/external-work';
import { ROUTES } from '@/lib/routes';
import MotorVehiclesTable from './MotorVehiclesTable';
import HeavyMachineryTable from './HeavyMachineryTable';
import { EXTERNAL_WORK_ERROR_STYLE } from './ExternalWorkStatusBadge';

const pagerBtn =
  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--foreground)] hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';

export default function ExternalWorksListView({ workType }: { workType: ExternalWorkType }) {
  const isVehicle = workType === 'vehicle';
  const title = isVehicle ? 'Motor Vehicles' : 'Heavy Machinery';
  const { rows, total, page, totalPages, isLoading, loadError, hasPrev, hasNext, prevPage, nextPage } =
    useExternalWorkList(workType);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.logistics.deliveries.externals}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--primary)] hover:opacity-80 transition-opacity mb-3"
        >
          <ArrowLeft size={13} /> Back to External Works
        </Link>
        <p className="gv-eyebrow">Logistics · External Works</p>
        <h1 className="text-2xl font-bold mt-1">{title}</h1>
        <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{total} total</p>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={EXTERNAL_WORK_ERROR_STYLE}>
          <AlertTriangle size={15} className="shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {isVehicle ? (
        <MotorVehiclesTable deliveries={rows.map(toMotorVehicleDelivery)} isLoading={isLoading} />
      ) : (
        <HeavyMachineryTable services={rows.map(toHeavyMachineryService)} isLoading={isLoading} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[color:var(--muted-foreground)]">Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button onClick={prevPage} disabled={!hasPrev || isLoading} className={pagerBtn}>
              <ChevronLeft size={14} /> Previous
            </button>
            <button onClick={nextPage} disabled={!hasNext || isLoading} className={pagerBtn}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}