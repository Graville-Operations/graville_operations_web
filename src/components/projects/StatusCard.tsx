export function StatusCard({ label, value, color, loading, minHeight = 72, height, valueSize = 'text-2xl' }: {
  label: string; value: number; color: string; loading?: boolean;
  minHeight?: number; height?: number; valueSize?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl px-2 py-3 gap-1"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', minHeight, height }}>
      {loading
        ? <div className="h-6 w-7 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        : <p className={`${valueSize} font-bold`} style={{ color }}>{value}</p>}
      <p className="text-sm text-center leading-tight" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
    </div>
  );
}