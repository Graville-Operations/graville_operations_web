export function QuickStatPill({ label, value, loading }: {
  label: string; value: number | string; loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-2 py-3"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <p className="text-sm mb-1 text-center font-medium" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
      {loading
        ? <div className="h-6 w-6 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className="text-3xl font-bold text-white leading-none">{value}</p>}
    </div>
  );
}