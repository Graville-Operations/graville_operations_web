'use client';

import { VehicleRepair, REPAIR_STATUS_META } from '@/types/vehicle-repair';
import EmptyState from '@/components/ui/emptystate';

interface RepairApprovalsTableProps {
  requests: VehicleRepair[];
  loading?: boolean;
  hasFilter: boolean;
  onRowClick: (repair: VehicleRepair) => void;
}

export default function RepairApprovalsTable({ requests, loading, hasFilter, onRowClick }: RepairApprovalsTableProps) {
  if (loading) {
    return (
      <div className="gv-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse border-b border-[color:var(--border)] last:border-0" style={{ background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.02)' }} />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title={hasFilter ? 'No requests match your search' : 'Nothing awaiting approval'}
        description={hasFilter ? 'Try a different search' : 'Repair requests needing approval will show up here'}
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
            <th className="px-4 py-3"><span className="gv-label">Issue</span></th>
            <th className="px-4 py-3"><span className="gv-label">Requested Cost</span></th>
            <th className="px-4 py-3"><span className="gv-label">Status</span></th>
            <th className="px-4 py-3"><span className="gv-label">Date</span></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const meta = REPAIR_STATUS_META[r.status];
            return (
              <tr
                key={r.id}
                onClick={() => onRowClick(r)}
                className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{r.vehicle} — {r.number_plate}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{r.issue}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">KES {r.requested_cost.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{r.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}