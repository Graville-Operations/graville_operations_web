import { ShimmerBar } from '@/components/shared/Shimmer';

export function UsageHeaderSkeleton() {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <div className="h-0.75 w-full bg-muted" />
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <ShimmerBar w="w-36" h="h-5" />
          <div className="flex gap-3">
            <ShimmerBar w="w-24" h="h-3" />
            <ShimmerBar w="w-16" h="h-3" />
          </div>
        </div>
        <ShimmerBar w="w-24" h="h-6" />
      </div>
    </div>
  );
}

export function UsageTableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <ShimmerBar w="w-[80%]" h="h-4" delayMs={j * 60} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsageDetailPageSkeleton() {
  return (
    <>
      <UsageHeaderSkeleton />
      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit animate-pulse">
        <div className="px-4 py-1.5 rounded-md w-28 h-7 bg-(--muted-foreground)/20" />
        <div className="px-4 py-1.5 rounded-md w-20 h-7 bg-(--muted-foreground)/10" />
      </div>
      <UsageTableSkeleton cols={3} rows={5} />
    </>
  );
}