export function KpiCard({ label, value, sub, icon: Icon, loading }: {
  label: string; value: React.ReactNode; sub?: string;
  icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl p-4"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
        <p className="text-base" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
      </div>
      {loading
        ? <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-4xl font-bold text-white leading-none">{value}</p>}
      {sub && <p className="text-base" style={{ color: 'var(--gv-text-subtle)' }}>{sub}</p>}
    </div>
  );
}