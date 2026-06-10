"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, ArrowRight, Send, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { PermitCategory, CreatePermitPayload } from "@/types/permits";

interface ApiUser { id: number; firstName: string; lastName: string; }
interface SelectedApprover { userId: number; name: string; stepOrder: number; }
interface CreatedPermit {
  id: number; title: string; description: string;
  status: string; permitCategory: string; currentStep: number;
}

function unwrapArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.items))   return inner.items   as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];
    }
    if (Array.isArray(obj.data))    return obj.data    as T[];
    if (Array.isArray(obj.items))   return obj.items   as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/** Safely format any date string — returns "—" instead of "Invalid Date" */
function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function CreatePermitPage() {
  const router = useRouter();
  const [step, setStep]             = useState<"form" | "confirm">("form");
  const [categories, setCategories] = useState<PermitCategory[]>([]);
  const [users, setUsers]           = useState<ApiUser[]>([]);
  const [creating, setCreating]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [approverOpen, setApproverOpen] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<SelectedApprover[]>([]);
  const [createdPermit, setCreatedPermit] = useState<CreatedPermit | null>(null);
  const approverRef = useRef<HTMLDivElement>(null);
  const descRef     = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (approverRef.current && !approverRef.current.contains(e.target as Node))
        setApproverOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [catsRes, usersRes] = await Promise.all([
          api.get("/permits/categories"),
          api.get("/users/list"),
        ]);
        setCategories(unwrapArray<PermitCategory>(catsRes.data));
        const up = usersRes.data?.data ?? usersRes.data;
        setUsers(Array.isArray(up) ? up : up?.items ?? []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const toggleApprover = (user: ApiUser) => {
    setSelectedApprovers((prev) => {
      const exists = prev.find((a) => a.userId === user.id);
      if (exists) return prev.filter((a) => a.userId !== user.id).map((a, i) => ({ ...a, stepOrder: i + 1 }));
      return [...prev, { userId: user.id, name: `${user.firstName} ${user.lastName}`, stepOrder: prev.length + 1 }];
    });
  };

  const handleCreate = async () => {
    setError(null);
    if (!form.title.trim())             return setError("Title is required.");
    if (!form.categoryId)               return setError("Please select a category.");
    if (selectedApprovers.length === 0) return setError("Please select at least one approver.");
    try {
      setCreating(true);
      const payload: CreatePermitPayload = {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        category_id: Number(form.categoryId),
        approvers:   selectedApprovers.map((a) => ({ approver_id: a.userId, step_order: a.stepOrder })),
      };
      const { data } = await api.post("/permits/create", payload);
      if (data?.code !== 200) throw new Error(data?.message || "Failed to create permit.");
      setCreatedPermit(data.data);
      setStep("confirm");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create permit.");
    } finally { setCreating(false); }
  };

  const handleSubmit = async () => {
    if (!createdPermit) return;
    try {
      setSubmitting(true);
      const { data } = await api.post(`/permits/submit/${createdPermit.id}`, {});
      if (data?.code !== 200) throw new Error(data?.message || "Failed to submit.");
      setSubmitted(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit.");
    } finally { setSubmitting(false); }
  };

  const selectedCategory = categories.find((c) => c.id === Number(form.categoryId));

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
          {/* ✅ Fixed route: /permits/my-permits */}
          <button onClick={() => router.push("/permits/my-permits")}
            className="gv-btn-brand px-6 py-2.5 rounded-xl text-sm font-semibold">
            View My Permits
          </button>
          <button
            onClick={() => {
              setStep("form"); setSubmitted(false); setCreatedPermit(null);
              setForm({ title: "", description: "", categoryId: "" });
              setSelectedApprovers([]); setError(null);
            }}
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === "confirm" ? setStep("form") : router.back()}
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
            <select value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="gv-input w-full text-sm py-3"
              style={{ background: "var(--gv-glass-bg)", color: form.categoryId ? "white" : "var(--gv-text-faint)" }}>
              <option value="" style={{ background: "#0d1528" }}>
                {categories.length === 0 ? "Loading categories…" : "Select category"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
              ))}
            </select>
          </div>

          <div ref={approverRef} className="relative">
            <label className="gv-eyebrow mb-1 block">Approvers *</label>
            <button type="button" onClick={() => setApproverOpen((p) => !p)}
              className="gv-input w-full text-sm py-3 flex items-center justify-between"
              style={{ color: selectedApprovers.length ? "white" : "var(--gv-text-faint)" }}>
              <span className="truncate">
                {selectedApprovers.length === 0
                  ? users.length === 0 ? "Loading users…" : "Select approvers"
                  : selectedApprovers.map((a) => a.name).join(", ")}
              </span>
              <ChevronDown size={15} className={`ml-2 shrink-0 transition-transform ${approverOpen ? "rotate-180" : ""}`} />
            </button>
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
                <p className="gv-eyebrow text-[10px] mb-0.5">{label}</p>
                <p className="text-sm" style={{ color: label === "Status" ? "#fbbf24" : "var(--gv-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* ✅ Approvers — plain name list, no step numbers */}
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