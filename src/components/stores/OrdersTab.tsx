import { ShoppingCart, Package } from 'lucide-react';
import { useUsageOrders } from '@/hooks/stores/useUsageOrders';
import { UsageTableSkeleton } from '@/components/stores/UsageDetailSkeletons';
import { ActivityErrorState, ActivityTableEmptyState } from '@/components/stores/ActivityStates';

export function OrdersTab({ usageId }: { usageId: number }) {
  const { orders, loading, error, refetch } = useUsageOrders(usageId);

  if (loading) return <UsageTableSkeleton cols={3} rows={4} />;
  if (error)   return <ActivityErrorState message="Failed to load orders for this report." onRetry={refetch} />;
  if (!orders.length) {
    return (
      <ActivityTableEmptyState
        icon={<ShoppingCart size={36} />}
        message="No orders recorded for this report"
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[25%]" />
          <col className="w-[35%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted">
            {['Material', 'Qty Ordered', 'Requested By'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => {
            const mat   = order.material     as Record<string, unknown> | undefined;
            const unit  = mat?.unit          as Record<string, unknown> | undefined;
            const reqBy = order.requested_by as Record<string, unknown> | undefined;
            const qty   = order.quantityOrdered ?? order.quantity_ordered ?? order.quantity ?? '—';
            return (
              <tr
                key={(order.id as number) ?? idx}
                className="border-b border-border last:border-0 hover:bg-accent transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Package size={12} className="text-primary" />
                    </div>
                    {(mat?.name as string) ?? '—'}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className="font-semibold">{qty as string | number}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {(unit?.symbol as string) ?? (unit?.name as string) ?? ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {(reqBy?.name as string) ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}