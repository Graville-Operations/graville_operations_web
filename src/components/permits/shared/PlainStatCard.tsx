export function PlainStatCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="gv-card gv-stat-card">
      <p className="text-4xl font-bold text-white leading-none" style={{ letterSpacing: "-0.02em" }}>{count}</p>
      <p className="gv-eyebrow mt-2">{label}</p>
    </div>
  );
}