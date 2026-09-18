'use client';

import { MotorVehicleDelivery } from '@/types/external-work';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';

interface MotorVehiclesTableProps {
  deliveries: MotorVehicleDelivery[];
  isLoading?: boolean;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  in_progress: 'bg-sky-500/10 text-sky-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? 'bg-white/10 text-[color:var(--muted-foreground)]';
  const label = status.replace('_', ' ');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${cls}`}>
      {label}
    </span>
  );
}

const COLUMN_COUNT = 8;

export default function MotorVehiclesTable({ deliveries, isLoading }: MotorVehiclesTableProps) {
  return (
    <div className="gv-card p-0 overflow-x-auto">
      {isLoading && <ShimmerStyle />}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-left">
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Vehicle</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Material</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Quantity</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Pickup Point</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Destination</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Amount</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Client</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Status</span></th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-[color:var(--border)] last:border-0">
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <Bone w={j === 0 ? '7rem' : j === 1 ? '10rem' : '5rem'} />
                  </td>
                ))}
              </tr>
            ))
          ) : deliveries.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className="p-0">
                <EmptyState
                  title="No motor vehicle deliveries yet"
                  description="Deliveries you add will show up here"
                  fullScreen={false}
                />
              </td>
            </tr>
          ) : (
            deliveries.map((d) => (
              <tr key={d.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
                <td className="px-4 py-3 font-medium text-[color:var(--foreground)] whitespace-nowrap">{d.numberPlate}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] max-w-xs">
                  {d.materials.map((m, idx) => (
                    <p key={idx} className="whitespace-nowrap">{m.name}</p>
                  ))}
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] whitespace-nowrap">
                  {d.materials.map((m, idx) => (
                    <p key={idx}>{m.quantity}</p>
                  ))}
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.pickupPoint}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.destination}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] whitespace-nowrap">{d.amount}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                  <p>{d.clientName}</p>
                  <p className="text-xs">{d.clientPhone}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}