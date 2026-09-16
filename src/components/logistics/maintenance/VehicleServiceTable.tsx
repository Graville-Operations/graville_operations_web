'use client';

import { VehicleService, SERVICE_TYPE_LABELS, SERVICE_STATUS_META } from '@/types/vehicle-service';
import EmptyState from '@/components/ui/emptystate';

interface VehicleServiceTableProps {
  services: VehicleService[];
  loading?: boolean;
  hasFilter: boolean;
}

function formatCost(value: number | null): string {
  if (value == null) return '—';
  return `KES ${value.toLocaleString()}`;
}

export default function VehicleServiceTable({ services, loading, hasFilter }: VehicleServiceTableProps) {
  if (loading) {
    return (
      <div className="gv-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse border-b border-[color:var(--border)] last:border-0" style={{ background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.02)' }} />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title={hasFilter ? 'No services match your filters' : 'No service requests yet'}
        description={hasFilter ? 'Try adjusting your search or filters' : 'Vehicle service requests will show up here'}
        fullScreen={false}
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-left">
            <th className="px-4 py-3"><span className="gv-label">Vehicle</span></th>
            <th className="px-4 py-3"><span className="gv-label">Requested Service Type</span></th>
            <th className="px-4 py-3"><span className="gv-label">Approved Service Type</span></th>
            <th className="px-4 py-3"><span className="gv-label">Mileage</span></th>
            <th className="px-4 py-3"><span className="gv-label">Requested Cost</span></th>
            <th className="px-4 py-3"><span className="gv-label">Approved Cost</span></th>
            <th className="px-4 py-3"><span className="gv-label">Status</span></th>
            <th className="px-4 py-3"><span className="gv-label">Date</span></th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => {
            const meta = SERVICE_STATUS_META[s.status];
            return (
              <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
                <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{s.vehicle} — {s.number_plate}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{SERVICE_TYPE_LABELS[s.requested_service_type]}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                  {s.approved_service_type ? SERVICE_TYPE_LABELS[s.approved_service_type] : '—'}
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.mileage.toLocaleString()} km</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{formatCost(s.requested_cost)}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{formatCost(s.approved_cost)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}