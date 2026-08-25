'use client';

import { MotorVehicleDelivery } from '@/types/external-work';
import EmptyState from '@/components/ui/emptystate';

interface MotorVehiclesTableProps {
  deliveries: MotorVehicleDelivery[];
}

export default function MotorVehiclesTable({ deliveries }: MotorVehiclesTableProps) {
  if (deliveries.length === 0) {
    return (
      <EmptyState
        title="No motor vehicle deliveries yet"
        description="Deliveries you add will show up here"
        fullScreen={false}
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-left">
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Vehicle</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Material</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Quantity</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Pickup Point</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Destination</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Amount</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Client Name</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Client Phone No.</span></th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr key={d.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
              <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{d.vehicle}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.material}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.quantity}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.pickupPoint}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.destination}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.amount}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.clientName}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.clientPhone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}