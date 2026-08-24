export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="gv-tag"
      style={{
        color: active ? '#33907C' : 'var(--gv-text-subtle)',
        background: active ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
        border: `1px solid ${active ? 'rgba(51,144,124,0.35)' : 'var(--border)'}`,
      }}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}