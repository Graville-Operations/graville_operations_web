import { useRouter } from "next/router";
import { useState } from "react";
import { Permit, PermitStatus } from "@/types/permits";
import { submitPermit } from "@/lib/permitsApi";

// ─── Status Badge ─────────────────────────────────────────────────────────────
// Named export — import like:
// import PermitCard, { PermitStatusBadge } from "@/components/permits/PermitCard"

const STATUS_CONFIG: Record<PermitStatus, { label: string; classes: string }> = {
  draft:              { label: "Draft",              classes: "bg-gray-100 text-gray-600 border border-gray-200" },
  submitted:          { label: "Submitted",          classes: "bg-blue-50 text-blue-700 border border-blue-200" },
  under_review:       { label: "Under Review",       classes: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  approved:           { label: "Approved",           classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:           { label: "Rejected",           classes: "bg-red-50 text-red-700 border border-red-200" },
  revision_requested: { label: "Revision Requested", classes: "bg-orange-50 text-orange-700 border border-orange-200" },
};

export function PermitStatusBadge({ status, className = "" }: { status: PermitStatus; className?: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-gray-100 text-gray-600 border border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.classes} ${className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Permit Card ──────────────────────────────────────────────────────────────

interface PermitCardProps {
  permit: Permit;
  onRefresh?: () => void;
  showActions?: boolean;
}

export default function PermitCard({ permit, onRefresh, showActions = true }: PermitCardProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitPermit(permit.id);
      onRefresh?.();
    } catch (err: any) {
      alert(err.message || "Failed to submit permit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{permit.title}</h3>
          {permit.category && <p className="text-xs text-gray-400 mt-0.5">{permit.category.name}</p>}
        </div>
        <PermitStatusBadge status={permit.status} />
      </div>

      {permit.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{permit.description}</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-[11px] text-gray-400">
          {new Date(permit.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        {showActions && (
          <div className="flex gap-2">
            <button onClick={() => router.push(`/permits/${permit.id}`)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              View
            </button>
            {permit.status === "draft" && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}