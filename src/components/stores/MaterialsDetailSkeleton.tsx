import { ShimmerBar } from '@/components/shared/Shimmer';

export function MaterialsDetailSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((colIdx) => (
        <div key={colIdx} className="gv-card p-0 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[68%]" />
              <col className="w-[32%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Material
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-4">
                    <ShimmerBar w="w-[85%]" h="h-4" />
                    <div className="mt-2">
                      <ShimmerBar w="w-24" h="h-3" delayMs={i * 60} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="ml-auto">
                      <ShimmerBar w="w-14" h="h-4" delayMs={i * 80} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}