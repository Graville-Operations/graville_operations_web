'use client';

import { HeavyMachineryService } from '@/types/external-work';
import EmptyState from '@/components/ui/emptystate';

interface HeavyMachineryTableProps {
  services: HeavyMachineryService[];
}

export default function HeavyMachineryTable({ services }: HeavyMachineryTableProps) {
  if (services.length === 0) {
    return (
      <EmptyState
        title="No heavy machinery services yet"
        description="Services you add will show up here"
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
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Location</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Service</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Amount</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Client Name</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Client Phone No.</span></th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
              <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{s.vehicle}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.location}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.service}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.amount}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.clientName}</td>
              <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.clientPhone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}