import { Package } from 'lucide-react';
import type { StoreMaterial } from '@/types/store';

export function MaterialsRegisterTable({ items, search }: { items: StoreMaterial[]; search: string }) {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[30%]" />
          <col className="w-[30%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            {['Material', 'Quantity', 'Min. Level'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                     text-muted-foreground uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-12 text-muted-foreground">
                <Package size={32} className="mx-auto mb-2 opacity-20" />
                <p>{search ? 'No materials match your search' : 'No materials found'}</p>
              </td>
            </tr>
          ) : items.map((mat) => {
            const unitLabel = mat.unit?.symbol ?? mat.unit?.name ?? '';
            return (
              <tr
                key={mat.id}
                className="border-b border-border last:border-0 hover:bg-accent transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <p>{mat.name}</p>
                  {mat.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{mat.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className="font-semibold">{mat.quantity}</span>
                  {unitLabel && (
                    <span className="ml-1 text-xs text-muted-foreground">{unitLabel}</span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {mat.minimumStockLevel != null ? (
                    <>
                      <span className="font-medium">{mat.minimumStockLevel}</span>
                      {unitLabel && (
                        <span className="ml-1 text-xs text-muted-foreground">{unitLabel}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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