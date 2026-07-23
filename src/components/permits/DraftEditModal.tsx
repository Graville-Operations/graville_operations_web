"use client";

import { useState } from "react";
import { X, Pencil, Send, Check } from "lucide-react";
import { PermitCategory, PermitDetail } from "@/types/permits";
import { ApiUser } from "@/types";
import { submitPermit, resolveErrorMessage } from "@/lib/api/permits";
import { SelectedApprover, toggleApproverIn } from "@/lib/utils/approvers";
import { autoResize } from "@/lib/utils/textarea";
import { ApproverSelect } from "./ApproverSelect";
import { StatusBadge } from "./shared/StatusBadge";

interface DraftEditModalProps {
  permit: PermitDetail;
  categories: PermitCategory[];
  users: ApiUser[];
  onClose: () => void;
  onSubmitted: () => void;
}

export function DraftEditModal({ permit, categories, users, onClose, onSubmitted }: DraftEditModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: permit.title ?? "",
    description: permit.description ?? "",
    categoryId: String(permit.categoryId ?? ""),
  });
  const [selectedApprovers, setSelectedApprovers] = useState<SelectedApprover[]>(() =>
    (permit.approvals ?? [])
      .sort((a, b) => a.step_order - b.step_order)
      .map((a, i) => ({ userId: i, name: a.approver ?? "", stepOrder: a.step_order }))
  );

  const toggleApprover = (user: ApiUser) => {
    setSelectedApprovers((prev) => toggleApproverIn(prev, user));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.categoryId) return setError("Please select a category.");
    if (selectedApprovers.length === 0) return setError("Please select at least one approver.");
    try {
      setSubmitting(true);
      await submitPermit(permit.id);
      setSuccess(true);
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to submit."));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
        <div className="w-full max-w-sm rounded-2xl flex flex-col items-center text-center space-y-4 p-8" style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(51,144,124,0.2)", border: "2px solid #33907c" }}>
            <Check size={28} className="text-[#33907c]" />
          </div>
          <div>
            <p className="font-bold text-base text-white mb-1">Permit Submitted!</p>
            <p className="text-sm" style={{ color: "var(--gv-text-muted)" }}>Now pending review by assigned approvers.</p>
          </div>
          <button onClick={() => { onSubmitted(); onClose(); }} className="gv-btn-brand px-8 py-2.5 rounded-xl text-sm font-semibold">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full md:max-w-lg max-h-[95vh] overflow-y-auto rounded-t-2xl md:rounded-2xl" style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--gv-glass-border)" }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><Pencil size={16} className="text-[#33907c]" /></div>
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--gv-text-primary)" }}>Edit & Submit</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--gv-text-muted)" }}>Review your draft and submit for approval</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="Draft" />
            {/* Cancel just closes — draft stays in the list untouched */}
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="gv-eyebrow mb-1 block">Title *</label>
            <input
              type="text"
              className="gv-input w-full text-sm"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">
              Description <span style={{ color: "var(--gv-text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="gv-input w-full text-sm resize-none overflow-hidden"
              rows={3}
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                autoResize(e.target);
              }}
              style={{ minHeight: "80px", transition: "height 0.1s ease" }}
            />
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="gv-input w-full text-sm"
              style={{ background: "var(--gv-glass-bg)", color: "white" }}
            >
              <option value="" style={{ background: "#0d1528" }}>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
              ))}
            </select>
          </div>

          <ApproverSelect users={users} selected={selectedApprovers} onToggle={toggleApprover} />

          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            Once submitted, the permit will be sent to approvers and cannot be edited.
          </div>

          <div className="flex gap-3 pt-1">
            {/* Cancel → only onClose, permit stays Draft in the list */}
            <button onClick={onClose} className="gv-btn-outline flex-1 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><Send size={14} /> Submit for Approval</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}