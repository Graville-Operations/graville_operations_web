export function TransferDetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--gv-text-muted)' }}
      >
        {label}
      </p>
      <div className="text-sm" style={{ color: 'var(--gv-text-primary)' }}>
        {value ?? '—'}
      </div>
    </div>
  );
}