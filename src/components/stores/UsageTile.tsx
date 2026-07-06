import { ChevronRight, Layers, Package, ShoppingCart, Building2 } from 'lucide-react';
import { statusOrder } from '@/components/stores/statusOrder';
import type { UsageLog } from '@/types/store';

export function UsageTile({ log, onClick }: { log: UsageLog; onClick: () => void }) {
  const status = statusOrder[log.status];

  return (
    <button
      onClick={onClick}
      className="gv-card p-0 overflow-hidden text-left w-full group
             hover:border-(--gv-glass-border-hover)
             hover:shadow-[0_4px_24px_rgba(0,0,0,0.18)]
             transition-all duration-200 cursor-pointer"
    >
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${status.color}55, transparent)` }}
      />

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold leading-tight">{log.date}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Building2 size={10} />
              {log.site_name}
            </p>
          </div>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
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

        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground">
            <Package size={9} />
            {log.materials_count} material{log.materials_count !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground">
            <ShoppingCart size={9} />
            {log.orders_count} order{log.orders_count !== 1 ? 's' : ''}
          </span>
        </div>

        {log.notes && log.notes !== 'string' && (
          <p className="text-[11px] text-muted-foreground italic line-clamp-1">
            {log.notes}
          </p>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border bg-(--muted)/30
                      flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers size={10} />
            {log.materials_count + log.orders_count} total entries
          </span>
        </div>
        <ChevronRight
          size={13}
          className="text-muted-foreground group-hover:text-foreground
                     group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}