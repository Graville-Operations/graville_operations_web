import type { ToolItem } from '@/types/store';

const TOOL_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'text-[color:var(--gv-text-success)]',
  IN_USE:    'text-[color:var(--gv-text-info)]',
  DAMAGED:   'text-[color:var(--destructive)]',
};

const TOOL_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Available',
  IN_USE:    'In Use',
  DAMAGED:   'Damaged',
};

const GRID_COLS = { gridTemplateColumns: '1fr 1fr 90px' };

export function ToolsDetailTable({ items }: { items: ToolItem[] }) {
  return (
    <div className="gv-card flex flex-col gap-0 p-0 overflow-hidden">
      <div
        className="grid gap-x-2 px-4 py-2.5 border-b border-border bg-muted"
        style={GRID_COLS}
      >
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Name
        </p>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Vendor
        </p>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
          Status
        </p>
      </div>

      <div className="divide-y divide-border">
        {items.map((t) => (
          <div
            key={t.id}
            className="grid gap-x-2 items-center px-4 py-3 hover:bg-accent transition-colors"
            style={GRID_COLS}
          >
            <p className="text-sm font-medium truncate">{t.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {t.vendor ?? '—'}
            </p>
            <span className={`text-xs font-medium text-right ${
              TOOL_STATUS_COLOR[t.status] ?? 'text-muted-foreground'
            }`}>
              {TOOL_STATUS_LABEL[t.status] ?? t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}