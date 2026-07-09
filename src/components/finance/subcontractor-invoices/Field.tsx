interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <div className="text-sm text-white">{children}</div>
    </div>
  );
}