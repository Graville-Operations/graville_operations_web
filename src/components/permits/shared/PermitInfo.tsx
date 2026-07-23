import { PermitDetail, APPROVAL_STYLES } from "@/types/permits";
import { formatPermitDate } from "@/lib/utils/permit-date";

interface MetaField {
  label: string;
  value: string;
}

export function buildPermitMetaFields(
  selected: PermitDetail,
  includeLastUpdated: boolean
): MetaField[] {
  const fields: MetaField[] = [
    { label: "Requested By", value: selected.requester ?? "—" },
    { label: "Category", value: selected.permitCategory ?? "—" },
    { label: "Site", value: selected.siteName ?? "—" },
    { label: "Created", value: formatPermitDate(selected.created_at) },
  ];
  if (includeLastUpdated) {
    fields.push({ label: "Last Updated", value: formatPermitDate(selected.updated_at) });
  }
  return fields;
}

export function PermitMetaGrid({ fields }: { fields: MetaField[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {fields.map(({ label, value }) => (
        <div key={label}>
          <p className="gv-eyebrow mb-0.5 text-label-sm">{label}</p>
          <p className="text-xs font-medium" style={{ color: "var(--gv-text-primary)" }}>{value}</p>
        </div>
      ))}
    </div>
  );
}
export function PermitDescription({ description, title }: { description?: string | null; title?: string }) {
  const isPlaceholder = !description || (title && description.trim() === title.trim());
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--gv-glass-border)" }}>
      <p className="gv-eyebrow text-label-sm mb-1">Description</p>
      <p className="text-xs leading-relaxed" style={{ color: isPlaceholder ? "var(--gv-text-faint)" : "var(--gv-text-muted)" }}>
        {isPlaceholder ? "No description provided" : description}
      </p>
    </div>
  );
}
export function ApproversTable({ approvals }: { approvals: PermitDetail["approvals"] }) {
  if (!approvals || approvals.length === 0) return null;
  const hasComment = approvals.some((a) => a.comment);
  const sorted = [...approvals].sort((a, b) => a.step_order - b.step_order);

  return (
    <div>
      <p className="gv-eyebrow text-label-sm mb-2">Approvers</p>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--gv-glass-border)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "rgba(51,144,124,0.08)" }}>
              {["Approver", "Status", ...(hasComment ? ["Comment"] : [])].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#33907c", fontSize: "10px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((approval) => {
              const ast = APPROVAL_STYLES[approval.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
              return (
                <tr key={approval.id} style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                  <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>{approval.approver ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: ast.bg, color: ast.color }}>
                      {approval.status}
                    </span>
                  </td>
                  {hasComment && (
                    <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>{approval.comment ?? "—"}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}