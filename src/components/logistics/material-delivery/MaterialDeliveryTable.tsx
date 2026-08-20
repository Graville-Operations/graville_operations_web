'use client';

import { MaterialDelivery, DELIVERY_STATUS_META } from '@/types/material-delivery';
import EmptyState from '@/components/ui/emptystate';

interface MaterialDeliveryTableProps {
  deliveries: MaterialDelivery[];
  loading?: boolean;
  hasFilter: boolean;
}

export default function MaterialDeliveryTable({ deliveries, loading, hasFilter }: MaterialDeliveryTableProps) {
  if (loading) {
    return (
      <div className="gv-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse border-b border-[color:var(--border)] last:border-0" style={{ background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.02)' }} />
        ))}
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <EmptyState
        title={hasFilter ? 'No deliveries match your filters' : 'No deliveries yet'}
        description={hasFilter ? 'Try adjusting your search or filters' : 'Initiated deliveries will show up here'}
        fullScreen={false}
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-left">
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap">
              <span className="gv-label">Material</span>
            </th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap">
              <span className="gv-label">Quantity</span>
            </th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap">
              <span className="gv-label">Pickup Point</span>
            </th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap">
              <span className="gv-label">Destination</span>
            </th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap">
              <span className="gv-label">Status</span>
            </th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap">
              <span className="gv-label">Date</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => {
            const meta = DELIVERY_STATUS_META[d.status];
            return (
              <tr key={d.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
                <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{d.material}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.quantity}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.pickupPoint}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.destination}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}