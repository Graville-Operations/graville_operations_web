export function MenuSkeleton() {
  return (
    <div className="space-y-2 pt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}