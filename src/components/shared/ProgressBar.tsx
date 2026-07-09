
export function ProgressBar({ pct, color = 'var(--gv-brand)', height = 'h-2' }: {
  pct: number; color?: string; height?: string;
}) {
  return (
    <div className={`w-full ${height} rounded-full overflow-hidden`}
      style={{ background: 'var(--gv-glass-bg-strong)' }}>
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}