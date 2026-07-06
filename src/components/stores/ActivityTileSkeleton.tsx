export function ActivityTileSkeleton() {
  return (
    <div className="gv-card p-0 overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-muted rounded w-28" />
            <div className="h-5 bg-muted rounded-full w-20" />
        </div>
        <div className="h-3 bg-muted rounded w-40" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded w-16" />
        </div>
      </div>
      <div className="px-4 py-2 border-t border-border bg-muted/30 flex justify-between items-center">
        <div className="h-3 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-8" />
      </div>
    </div>
  );
}

export function ActivityTileSkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => <ActivityTileSkeleton key={i} />)}
    </div>
  );
}