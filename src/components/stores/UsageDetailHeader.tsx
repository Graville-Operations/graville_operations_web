import { Calendar, Building2 } from 'lucide-react';
import { statusOrder } from '@/components/stores/statusOrder';
import type { UsageLogStatus } from '@/types/store';

export function UsageDetailHeader({ log }: { log: Record<string, unknown> }) {
  const status   = statusOrder(log.status as UsageLogStatus, 11);
  const site     = log.site as Record<string, unknown> | undefined;
  const siteName = (site?.name as string) ?? '—';
  const items    = (log.items as unknown[]) ?? [];

  return (
    <div className="gv-card p-0 overflow-hidden">
      <div
        className="h-0.75 w-full"
        style={{ background: `linear-gradient(90deg, ${status.color}66, transparent)` }}
      />
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="font-semibold">{(log.date as string) ?? '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 size={11} />{siteName}
            </span>
            <span>{items.length} material{items.length !== 1 ? 's' : ''}</span>
            {Boolean(log.created_at) && <span>Created {log.created_at as string}</span>}
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto"
          style={{
            color: status.color,
            background: `color-mix(in srgb, ${status.color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${status.color} 25%, transparent)`,
          }}
        >
          {status.icon}
          {status.label}
        </span>
      </div>
    </div>
  );
}