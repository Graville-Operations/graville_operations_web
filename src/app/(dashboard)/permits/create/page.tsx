"use client";

import { ArrowRight, Send, ArrowLeft, Check } from "lucide-react";
import { Bone, ShimmerStyle } from "@/components/shared/Shimmer";
import { ApproverSelect } from "@/components/permits/ApproverSelect";
import { useCreatePermit } from "@/hooks/permits/useCreatePermit";
import { autoResize } from "@/lib/utils/textarea";

export default function CreatePermitPage() {
  const {
    step, setStep,
    categories, users,
    creating, submitting, submitted,
    error, form, setForm,
    selectedApprovers, toggleApprover,
    createdPermit, selectedCategory,
    handleCreate, handleSubmit, reset,
    goBack, viewMyPermits,
  } = useCreatePermit();

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-6 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(51,144,124,0.2)", border: "2px solid #33907c" }}>
          <Check size={40} className="text-[#33907c]" />
        </div>
        <div>
          <p className="font-bold text-lg text-white mb-1">Permit Submitted!</p>
          <p className="text-sm" style={{ color: "var(--gv-text-muted)" }}>
            Your permit is now pending review by the assigned approvers.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={viewMyPermits} className="gv-btn-brand px-6 py-2.5 rounded-xl text-sm font-semibold">
            View My Permits
          </button>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ShimmerStyle />
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-2 rounded-xl"
          style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)", color: "var(--gv-text-muted)" }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>
            {step === "form" ? "New Permit" : "Confirm & Submit"}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {["form", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full transition-all"
                    style={{ background: step === s || (s === "form" && step === "confirm") ? "#33907c" : "rgba(255,255,255,0.2)" }} />
                  <span className="text-xs" style={{ color: step === s ? "#33907c" : "var(--gv-text-subtle)" }}>
                    {s === "form" ? "Details" : "Review"}
                  </span>
                </div>
                {i === 0 && <div className="w-6 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form step */}
      {step === "form" && (
        <div className="gv-card space-y-6 p-8 md:p-10">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="gv-eyebrow mb-1 block">Title *</label>
            <input
              type="text"
              className="gv-input w-full text-sm py-3"
              placeholder="e.g. Driving Permit for Site Visit"
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
              rows={4}
              placeholder="Describe the purpose of this permit..."
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                autoResize(e.target);
              }}
              style={{ minHeight: "96px", transition: "height 0.1s ease" }}
            />
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">Category *</label>
            {categories.length === 0 ? (
              <Bone w="100%" h="2.875rem" />
            ) : (
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="gv-input w-full text-sm py-3"
                style={{ background: "var(--gv-glass-bg)", color: form.categoryId ? "white" : "var(--gv-text-faint)" }}
              >
                <option value="" style={{ background: "#0d1528" }}>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {users.length === 0 ? (
            <div>
              <label className="gv-eyebrow mb-1 block">Approvers *</label>
              <Bone w="100%" h="2.875rem" />
            </div>
          ) : (
            <ApproverSelect
              users={users}
              selected={selectedApprovers}
              onToggle={toggleApprover}
              buttonClassName="py-3"
            />
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-4 rounded-xl text-base font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
            ) : (
              <><ArrowRight size={15} /> Continue to Review</>
            )}
          </button>
        </div>
      )}

      {/* Confirm step */}
      {step === "confirm" && createdPermit && (
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          <div className="gv-card space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>Permit Details</p>
            {[
              { label: "Title", value: createdPermit.title },
              { label: "Category", value: selectedCategory?.name ?? "—" },
              {
                label: "Description",
                value:
                  createdPermit.description &&
                  createdPermit.description.trim() !== createdPermit.title.trim()
                    ? createdPermit.description
                    : "—",
              },
              { label: "Status", value: "Draft — will become Submitted after you confirm" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="gv-eyebrow text-label-sm mb-0.5">{label}</p>
                <p className="text-sm" style={{ color: label === "Status" ? "#fbbf24" : "var(--gv-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="gv-card space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>Approvers</p>
            {selectedApprovers.map((a) => (
              <div key={a.userId} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#33907c" }} />
                <p className="text-sm text-white">{a.name}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            Once submitted, the permit will be sent to approvers and cannot be edited.
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("form")}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><Send size={14} /> Submit for Approval</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}