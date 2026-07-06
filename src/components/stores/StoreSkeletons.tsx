export function CardSkeleton() {
  return (
    <div className="gv-card h-36 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-linear-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-border last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="relative overflow-hidden h-4 bg-muted rounded w-[75%]">
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                         bg-linear-to-r from-transparent via-white/5 to-transparent"
              style={{ animationDelay: `${i * 70}ms` }}
            />
          </div>
          {i === 0 && (
            <div className="relative overflow-hidden h-3 bg-muted rounded w-40 mt-1.5">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                             bg-linear-to-r from-transparent via-white/5 to-transparent"
                   style={{ animationDelay: '120ms' }} />
            </div>
          )}
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <RowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}