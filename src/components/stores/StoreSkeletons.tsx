import { ShimmerBar } from '@/components/shared/Shimmer';

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
          <ShimmerBar w="w-[75%]" h="h-4" delayMs={i * 70} />
          {i === 0 && (
            <div className="mt-1.5">
              <ShimmerBar w="w-40" h="h-3" delayMs={120} />
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