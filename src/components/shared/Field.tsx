
export function Field({ label, required, hint, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="gv-label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{hint}</p>}
    </div>
  );
}