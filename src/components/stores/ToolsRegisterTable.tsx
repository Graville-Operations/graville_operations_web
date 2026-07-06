import { Wrench, Clock } from 'lucide-react';
import type { StoreTool } from '@/types/store';

export function ToolsRegisterTable({ items, search }: { items: StoreTool[]; search: string }) {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[26%]" />
          <col className="w-[24%]" />
          <col className="w-[28%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            {['Tool', 'Vendor', 'Total Hire Cost (KES)', 'Hire End Date'].map((h) => (
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
              <td colSpan={4} className="text-center py-12 text-muted-foreground">
                <Wrench size={32} className="mx-auto mb-2 opacity-20" />
                <p>{search ? 'No tools match your search' : 'No tools found'}</p>
              </td>
            </tr>
          ) : items.map((tool) => {
            const t = tool as unknown as Record<string, unknown>;
            const isOverdue     = t.is_overdue === true;
            const hireEndDate   = t.hire_end_date as string | undefined;
            const totalHireCost = t.totalHireCost as number | undefined;
            return (
              <tr
                key={tool.id}
                className="border-b border-border last:border-0 hover:bg-accent transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Wrench size={13} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p>{tool.name}</p>
                      {tool.status && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                          {tool.status}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {tool.vendor && tool.vendor !== 'string' ? tool.vendor : '—'}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {totalHireCost != null
                    ? totalHireCost.toLocaleString('en-KE', { minimumFractionDigits: 2 })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {hireEndDate ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {isOverdue && <Clock size={10} />}
                      {hireEndDate}
                      {isOverdue && (
                        <span className="ml-1 font-semibold text-foreground">· Overdue</span>
                      )}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}