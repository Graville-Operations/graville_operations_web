export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--gv-text-subtle)' }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--gv-text-subtle)' }}>{label}</p>
        <p className="text-sm text-white break-all">{value}</p>
      </div>
    </div>
  );
}