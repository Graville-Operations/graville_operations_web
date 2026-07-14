"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, ArrowRight, Send, ArrowLeft } from "lucide-react";
import { useCreatePermit } from "@/hooks/permits/useCreatePermit";

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/** A shimmering skeleton block — uses the global @keyframes shimmer sweep */
function Shimmer({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md ${className}`}
      style={{ background: "rgba(255,255,255,0.06)", ...style }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
          transform: "translateX(-100%)",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  );
}

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

  // Pure UI state — dropdown open/closed — stays local to the component.
  const [approverOpen, setApproverOpen] = useState(false);
  const approverRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (approverRef.current && !approverRef.current.contains(e.target as Node))
        setApproverOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-6 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(51,144,124,0.2)", border: "2px solid #33907c" }}>
          <Check size={40} className="text-[#33907c]" />
        </div>
        <div>
          <p className="font-bold text-lg text-white mb-1">Permit Submitted!</p>
          <p className="text-sm" style={{ color: "var(--gv-text-muted)" }}>
            Your permit is now pending review by the assigned approvers.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={viewMyPermits}
            className="gv-btn-brand px-6 py-2.5 rounded-xl text-sm font-semibold">
            View My Permits
          </button>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}>
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-2 rounded-xl"
          style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)", color: "var(--gv-text-muted)" }}>
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

      {step === "form" && (
        <div className="gv-card space-y-6 p-8 md:p-10">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="gv-eyebrow mb-1 block">Title *</label>
            <input type="text" className="gv-input w-full text-sm py-3"
              placeholder="e.g. Driving Permit for Site Visit"
              value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">
              Description <span style={{ color: "var(--gv-text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              ref={descRef}
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
              <Shimmer className="h-11.5 w-full" />
            ) : (
              <select value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="gv-input w-full text-sm py-3"
                style={{ background: "var(--gv-glass-bg)", color: form.categoryId ? "white" : "var(--gv-text-faint)" }}>
                <option value="" style={{ background: "#0d1528" }}>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div ref={approverRef} className="relative">
            <label className="gv-eyebrow mb-1 block">Approvers *</label>
            {users.length === 0 ? (
              <Shimmer className="h-11.5 w-full" />
            ) : (
              <button type="button" onClick={() => setApproverOpen((p) => !p)}
                className="gv-input w-full text-sm py-3 flex items-center justify-between"
                style={{ color: selectedApprovers.length ? "white" : "var(--gv-text-faint)" }}>
                <span className="truncate">
                  {selectedApprovers.length === 0
                    ? "Select approvers"
                    : selectedApprovers.map((a) => a.name).join(", ")}
                </span>
                <ChevronDown size={15} className={`ml-2 shrink-0 transition-transform ${approverOpen ? "rotate-180" : ""}`} />
              </button>
            )}
            {approverOpen && (
              <div className="absolute z-20 w-full rounded-xl shadow-xl flex flex-col"
                style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)", bottom: "calc(100% + 4px)" }}>
                <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                  {users.length === 0 ? (
                    <p className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>Loading users…</p>
                  ) : users.map((u) => {
                    const sel = selectedApprovers.find((a) => a.userId === u.id);
                    return (
                      <button key={u.id} type="button" onClick={() => toggleApprover(u)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: sel ? "#33907c" : "white" }}>
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0`}
                            style={sel
                              ? { background: "#33907c" }
                              : { border: "1px solid rgba(255,255,255,0.25)" }}>
                            {sel && <Check size={10} color="white" />}
                          </span>
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                  <button type="button" onClick={() => setApproverOpen(false)}
                    className="w-full py-2 rounded-xl text-sm font-semibold" style={{ background: "#33907c", color: "white" }}>
                    Done {selectedApprovers.length > 0 && `(${selectedApprovers.length} selected)`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleCreate} disabled={creating}
            className="w-full py-4 rounded-xl text-base font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50">
            {creating
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              : <><ArrowRight size={15} /> Continue to Review</>}
          </button>
        </div>
      )}

      {step === "confirm" && createdPermit && (
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          <div className="gv-card space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>Permit Details</p>
            {[
              { label: "Title",       value: createdPermit.title },
              { label: "Category",    value: selectedCategory?.name ?? "—" },
              { label: "Description", value: createdPermit.description || "—" },
              { label: "Status",      value: "Draft — will become Submitted after you confirm" },
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

          <div className="rounded-xl px-4 py-3 text-xs"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            Once submitted, the permit will be sent to approvers and cannot be edited.
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}>
              Back
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                : <><Send size={14} /> Submit for Approval</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}