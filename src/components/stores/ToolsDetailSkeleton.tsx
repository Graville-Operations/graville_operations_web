import { ShimmerBar } from '@/components/shared/Shimmer';

const GRID_COLS = { gridTemplateColumns: '1fr 1fr 90px' };

export function ToolsDetailSkeleton() {
  return (
    <div className="gv-card flex flex-col gap-0 p-0 overflow-hidden">
      <div
        className="grid gap-x-2 px-4 py-2.5 border-b border-border bg-muted"
        style={GRID_COLS}
      >
        {['w-14', 'w-20', 'w-16'].map((w, i) => (
          <div key={i} className={i === 2 ? 'ml-auto' : ''}>
            <ShimmerBar w={w} h="h-3" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid gap-x-2 items-center px-4 py-3" style={GRID_COLS}>
            <ShimmerBar w="w-[75%]" h="h-4" delayMs={i * 50} />
            <ShimmerBar w="w-[60%]" h="h-4" delayMs={i * 70} />
            <div className="ml-auto">
              <ShimmerBar w="w-16" h="h-4" delayMs={i * 90} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}