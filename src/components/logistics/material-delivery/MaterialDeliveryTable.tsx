'use client';

import { DriverTask, DRIVER_TASK_STATUS_META, DRIVER_TASK_TYPE_LABELS } from '@/types/driver-task';
import EmptyState from '@/components/ui/emptystate';

interface MaterialDeliveryTableProps {
  deliveries: DriverTask[];
  loading?: boolean;
  hasFilter: boolean;
  siteNameById: Record<number, string>;
  transportLabelById: Record<number, string>;
}

function firstLineItem(task: DriverTask): { label: string; quantity: string; moreCount: number } | null {
  const combined = [
    ...(task.items ?? []).map((i) => ({ name: i.material_name, qty: i.planned_quantity })),
    ...(task.tool_items ?? []).map((t) => ({ name: t.tool_name, qty: t.planned_quantity })),
  ];
  if (combined.length === 0) return null;
  const [first, ...rest] = combined;
  return {
    label: first.name,
    quantity: first.qty != null ? String(first.qty) : '—',
    moreCount: rest.length,
  };
}

export default function MaterialDeliveryTable({
  deliveries, loading, hasFilter, siteNameById, transportLabelById,
}: MaterialDeliveryTableProps) {
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
        title={hasFilter ? 'No tasks match your filters' : 'No internal deliveries yet'}
        description={hasFilter ? 'Try adjusting your search or filters' : 'Created driver tasks will show up here'}
        fullScreen={false}
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-left">
            <th className="px-4 py-3"><span className="gv-label">Material/Tool</span></th>
            <th className="px-4 py-3"><span className="gv-label">Quantity</span></th>
            <th className="px-4 py-3"><span className="gv-label">Task Type</span></th>
            <th className="px-4 py-3"><span className="gv-label">Destination</span></th>
            <th className="px-4 py-3"><span className="gv-label">Transport</span></th>
            <th className="px-4 py-3"><span className="gv-label">Status</span></th>
            <th className="px-4 py-3"><span className="gv-label">Date</span></th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => {
            const meta = DRIVER_TASK_STATUS_META[d.status];
            const item = firstLineItem(d);
            return (
              <tr key={d.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--muted)] transition-colors">
                <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">
                  {item ? `${item.label}${item.moreCount ? ` +${item.moreCount} more` : ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{item ? item.quantity : '—'}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{DRIVER_TASK_TYPE_LABELS[d.task_type]}</td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                  {d.destination_site_id ? siteNameById[d.destination_site_id] ?? `Site #${d.destination_site_id}` : '—'}
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                  {d.transport_id ? transportLabelById[d.transport_id] ?? `#${d.transport_id}` : 'Unassigned'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{d.created_at}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}