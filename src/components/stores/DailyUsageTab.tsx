import { useMemo } from 'react';
import { ClipboardList, Package } from 'lucide-react';
import { ActivityTableEmptyState } from '@/components/stores/ActivityStates';

export function DailyUsageTab({ log }: { log: Record<string, unknown> }) {
  const items = useMemo(
    () => ((log.items as unknown[]) ?? []) as Record<string, unknown>[],
    [log],
  );

  if (items.length === 0) {
    return (
      <ActivityTableEmptyState
        icon={<ClipboardList size={36} />}
        message="No materials recorded for this report"
      />
    );
  }

  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[35%]" />
          <col className="w-[20%]" />
          <col className="w-[45%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted">
            {['Material', 'Qty Used', 'Notes'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const mat        = item.material as Record<string, unknown> | undefined;
            const unit       = mat?.unit     as Record<string, unknown> | undefined;
            const unitSymbol = (unit?.symbol as string) ?? (unit?.name as string) ?? '';
            const qty        = item.quantityUsed ?? '—';
            return (
              <tr
                key={(item.id as number) ?? idx}
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
                  {unitSymbol && (
                    <span className="ml-1 text-xs text-muted-foreground">{unitSymbol}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {(item.notes as string) || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}