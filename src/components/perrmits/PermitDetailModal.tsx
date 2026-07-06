"use client";

import { X, FileText } from "lucide-react";
import { PermitDetail } from "@/types/permits";
import { StatusBadge } from "./shared/StatusBadge";
import { PermitMetaGrid, buildPermitMetaFields, PermitDescription, ApproversTable } from "./shared/PermitInfo";

interface PermitDetailModalProps {
  selected: PermitDetail;
  onClose: () => void;
}

export function PermitDetailModal({ selected, onClose }: PermitDetailModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full md:max-w-xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto rounded-t-2xl md:rounded-2xl" style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="gv-icon-box p-1.5!"><FileText size={15} className="text-[#33907c]" /></div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: "var(--gv-text-primary)" }}>{selected.title}</p>
              <p className="text-xs" style={{ color: "var(--gv-text-muted)" }}>
                {selected.permitCategory ?? "—"} · {selected.siteName ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selected.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <PermitMetaGrid fields={buildPermitMetaFields(selected, true)} />
          <PermitDescription description={selected.description} />
          <ApproversTable approvals={selected.approvals} />
        </div>
      </div>
    </div>
  );
}