'use client';

import { HeavyMachineryService } from '@/types/external-work';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';

interface HeavyMachineryTableProps {
  services: HeavyMachineryService[];
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

const COLUMN_COUNT = 9;

export default function HeavyMachineryTable({ services, isLoading }: HeavyMachineryTableProps) {
  return (
    <div className="gv-card p-0 overflow-x-auto">
      {isLoading && <ShimmerStyle />}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-left">
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Machine</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Location</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Service</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Billing</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Duration</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Unit Amount</span></th>
            <th className="px-4 py-3 text-left align-middle whitespace-nowrap"><span className="gv-label">Total</span></th>
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
                    <Bone w={j === 0 ? '7rem' : '5rem'} />
                  </td>
                ))}
              </tr>
            ))
          ) : services.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className="p-0">
                <EmptyState
                  title="No heavy machinery services yet"
                  description="Services you add will show up here"
                  fullScreen={false}
                />
              </td>
            </tr>
          ) : (
            services.map((s) => (
              <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-medium text-[color:var(--foreground)]">{s.machine}</p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">{s.numberPlate}</p>
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.location}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{s.service}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] whitespace-nowrap">{s.billingMethodLabel}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] whitespace-nowrap">{s.duration}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] whitespace-nowrap">{s.unitAmount}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)] whitespace-nowrap font-medium">{s.totalAmount}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                  <p>{s.clientName}</p>
                  <p className="text-xs">{s.clientPhone}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}