
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="gv-card space-y-4">
      <p className="gv-eyebrow">{title}</p>
      {children}
    </div>
  );
}