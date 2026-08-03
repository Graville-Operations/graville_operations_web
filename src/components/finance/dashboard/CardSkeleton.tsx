'use client';

export function CardSkeleton() {
  return (
    <div className="gv-card h-full w-full overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-3/5 rounded bg-white/5" />
            <div className="h-2.5 w-2/5 rounded bg-white/5" />
          </div>
        </div>
        <div className="border-t border-white/5" />
        <div className="flex gap-2 pb-1">
          <div className="h-2.5 w-2/5 rounded bg-white/5" />
          <div className="h-2.5 w-6 rounded bg-white/5 ml-auto" />
          <div className="h-2.5 w-12 rounded bg-white/5" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg py-2 px-1">
            <div className="h-5 w-5 rounded bg-white/5 flex-shrink-0" />
            <div className="h-3 flex-1 rounded bg-white/5" />
            <div className="h-3 w-5 rounded bg-white/5" />
            <div className="h-3 w-14 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}