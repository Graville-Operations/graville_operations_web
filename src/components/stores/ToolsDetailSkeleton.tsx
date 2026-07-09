const GRID_COLS = { gridTemplateColumns: '1fr 1fr 90px' };

export function ToolsDetailSkeleton() {
  return (
    <div className="gv-card flex flex-col gap-0 p-0 overflow-hidden">
      <div
        className="grid gap-x-2 px-4 py-2.5 border-b border-border bg-muted"
        style={GRID_COLS}
      >
        {['w-14', 'w-20', 'w-16'].map((w, i) => (
          <div key={i} className={`relative overflow-hidden h-3 bg-muted rounded ${w} ${i === 2 ? 'ml-auto' : ''}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                            bg-linear-to-r from-transparent via-white/5 to-transparent" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid gap-x-2 items-center px-4 py-3" style={GRID_COLS}>
            <div className="relative overflow-hidden h-4 bg-muted rounded w-[75%]">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                              bg-linear-to-r from-transparent via-white/5 to-transparent"
                   style={{ animationDelay: `${i * 50}ms` }} />
            </div>
            <div className="relative overflow-hidden h-4 bg-muted rounded w-[60%]">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                              bg-linear-to-r from-transparent via-white/5 to-transparent"
                   style={{ animationDelay: `${i * 70}ms` }} />
            </div>
            <div className="relative overflow-hidden h-4 bg-muted rounded w-16 ml-auto">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                              bg-linear-to-r from-transparent via-white/5 to-transparent"
                   style={{ animationDelay: `${i * 90}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}