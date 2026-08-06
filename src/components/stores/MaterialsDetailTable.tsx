import type { MaterialItem } from '@/types/store';

export function MaterialsDetailTable({ items }: { items: MaterialItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="gv-card p-0 overflow-hidden h-full">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[68%]" />
          <col className="w-[32%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="text-left px-4 py-3 text-xs font-semibold
                           text-muted-foreground uppercase tracking-wider">
              Material
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold
                           text-muted-foreground uppercase tracking-wider">
              Qty
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const isLow = m.is_low_stock;
            const unitSymbol = m.unit?.symbol ?? m.unit?.name ?? '';
            return (
              <tr
                key={m.id}
                className="border-b border-border last:border-0
                           hover:bg-accent transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium truncate">{m.name}</p>
                  {isLow && (
                    <p className="text-[11px] text-(--gv-text-warn) mt-0.5 leading-none">
                      Low stock
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className={`font-semibold ${
                    isLow ? 'text-(--gv-text-warn)' : 'text-foreground'
                  }`}>
                    {m.quantity.toLocaleString()}
                  </span>
                  {unitSymbol && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {unitSymbol}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}