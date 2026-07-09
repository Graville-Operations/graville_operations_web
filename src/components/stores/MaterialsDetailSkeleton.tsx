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
                    <div className="relative overflow-hidden h-4 bg-muted rounded w-[85%]">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                                      bg-linear-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                    <div className="relative overflow-hidden h-3 bg-muted rounded w-24 mt-2">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                                      bg-linear-to-r from-transparent via-white/5 to-transparent"
                           style={{ animationDelay: `${i * 60}ms` }} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative overflow-hidden h-4 bg-muted rounded w-14 ml-auto">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                                      bg-linear-to-r from-transparent via-white/5 to-transparent"
                           style={{ animationDelay: `${i * 80}ms` }} />
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