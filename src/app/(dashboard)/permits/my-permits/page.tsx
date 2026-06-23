/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  X, FileText, Plus, Search, ChevronDown, Check,
  Send, Pencil, Tag, Trash2, AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  PermitListItem, PermitDetail, PermitCategory,
  STATUS_STYLES, APPROVAL_STYLES,
} from "@/types/permits";

// ─── Local types ──────────────────────────────────────────────────────────────

interface ApiUser { id: number; firstName: string; lastName: string; }
interface SelectedApprover { userId: number; name: string; stepOrder: number; }

// PermitApproval and PermitDetail are imported from @/types/permits
// PermitDetail.approvals already types approver as string from the backend mapper
type PermitDetailWithRaw = PermitDetail;

const MANAGER_ROLES  = ["DIRECTOR", "DEPARTMENT_MANAGER"];
const FIELD_OPERATOR = "FIELD_OPERATOR";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normaliseCategory(r: any): PermitCategory {
  return {
    id:          r.id,
    name:        r.name,
    description: r.description ?? null,
    is_active:   r.is_active ?? r.isActive ?? true,
  };
}

/**
 * Safe date formatter.
 * The backend's FormattedDateTime may return a pre-formatted string like "12 Jun 2025"
 * that new Date() can't parse. We try ISO first; if it fails we use the string as-is.
 */
function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }
  // Already a formatted string from the backend — display directly
  return val;
}

/** Auto-resizes a textarea to fit its content — call on every onChange */
function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function StatusBadge({ status }: { status: string }) {
  const st = STATUS_STYLES[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: st.bg, color: st.color }}>{status}</span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" />
    </div>
  );
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

/** Skeleton row matching the desktop permits table columns */
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
      <td className="px-4 py-3"><Shimmer className="h-4 w-32" /></td>
      <td className="px-4 py-3"><Shimmer className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Shimmer className="h-5 w-16 rounded-full" /></td>
      <td className="px-4 py-3"><Shimmer className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Shimmer className="h-4 w-16" /></td>
    </tr>
  );
}

/** Skeleton card matching the mobile permit card layout */
function SkeletonCard() {
  return (
    <div className="gv-card" style={{ padding: "14px 16px" }}>
      <div className="flex items-center justify-between mb-2">
        <Shimmer className="h-4 w-28" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <Shimmer className="h-3 w-20 mb-3" />
      <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
        <Shimmer className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Skeleton stat card matching StatCard layout */
function SkeletonStatCard() {
  return (
    <div className="gv-card gv-stat-card">
      <Shimmer className="h-9 w-12 mb-2" />
      <Shimmer className="h-3 w-14" />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="gv-card gv-stat-card">
      <p className="text-4xl font-bold text-white leading-none" style={{ letterSpacing: "-0.02em" }}>{count}</p>
      <p className="gv-eyebrow mt-2">{label}</p>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ categoryName, onConfirm, onCancel, deleting }: {
  categoryName: string; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl space-y-4 p-6"
        style={{ background: "#0d1528", border: "1px solid rgba(248,113,113,0.3)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(248,113,113,0.15)" }}>
            <AlertTriangle size={18} style={{ color: "#f87171" }} />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Deactivate category?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
              &quot;{categoryName}&quot; will no longer appear for new permits.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
            {deleting
              ? <><div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Deactivating...</>
              : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category form overlay modal ──────────────────────────────────────────────

function CategoryFormModal({ editTarget, onClose, onSaved }: {
  editTarget: PermitCategory | null;
  onClose:   () => void;
  onSaved:   () => void;
}) {
  const [formName,  setFormName]  = useState(editTarget?.name ?? "");
  const [formDesc,  setFormDesc]  = useState(editTarget?.description ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    setFormError(null);
    if (!formName.trim()) return setFormError("Name is required.");
    try {
      setSaving(true);
      if (editTarget) {
        await api.patch(`/permits/category/${editTarget.id}`, {
          name: formName.trim(), description: formDesc.trim() || null,
        });
      } else {
        await api.post("/permits/category/create", {
          name: formName.trim(), description: formDesc.trim() || null,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to save category.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--gv-glass-border)" }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><Tag size={16} className="text-[#33907c]" /></div>
            <h3 className="font-bold text-base" style={{ color: "var(--gv-text-primary)" }}>
              {editTarget ? "Edit Category" : "New Category"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {formError && (
            <div className="rounded-xl px-3 py-2 text-xs font-medium" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {formError}
            </div>
          )}
          <div>
            <label className="gv-eyebrow mb-1 block">Name *</label>
            <input autoFocus type="text" className="gv-input w-full text-sm"
              placeholder="e.g. Transport, Construction"
              value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="gv-eyebrow mb-1 block">
              Description <span style={{ color: "var(--gv-text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input type="text" className="gv-input w-full text-sm" placeholder="Optional description..."
              value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="gv-btn-outline flex-1 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand disabled:opacity-50 flex items-center justify-center gap-2">
              {saving
                ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                : (editTarget ? "Save Changes" : "Create Category")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Categories tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories,   setCategories]   = useState<PermitCategory[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<PermitCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PermitCategory | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/permits/categories");
      const raw: any[] = data?.data?.items ?? data?.data ?? [];
      setCategories(raw.map(normaliseCategory));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit   = (cat: PermitCategory) => { setEditTarget(cat); setShowModal(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.patch(`/permits/category/${deleteTarget.id}`, { is_active: false });
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Failed to deactivate category.");
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      {showModal && (
        <CategoryFormModal
          editTarget={editTarget}
          onClose={() => setShowModal(false)}
          onSaved={fetchCategories}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          categoryName={deleteTarget.name}
          deleting={deleting}
          onCancel={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {deleteError && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between"
          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-3 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--gv-text-muted)" }}>{categories.length} categories</p>
        <button onClick={openCreate} className="gv-btn-brand flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Plus size={15} /> New Category
        </button>
      </div>
      <div className="gv-card p-0! overflow-hidden">
        {loading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Name", "Description", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-40" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-12" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <FileText size={40} style={{ color: "var(--gv-text-faint)" }} className="mb-3" />
            <p className="text-sm mb-3" style={{ color: "var(--gv-text-subtle)" }}>No categories yet.</p>
            <button onClick={openCreate} className="gv-btn-brand px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <Plus size={14} /> Create first category
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Name", "Description", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id}
                  style={{ borderBottom: idx < categories.length - 1 ? "1px solid var(--gv-glass-border)" : "none" }}>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--gv-text-primary)" }}>{cat.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{cat.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--gv-text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#33907c")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gv-text-muted)")}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--gv-text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gv-text-muted)")}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Draft Edit Modal ─────────────────────────────────────────────────────────

function DraftEditModal({ permit, categories, users, onClose, onSubmitted }: {
  permit:      PermitDetailWithRaw;
  categories:  PermitCategory[];
  users:       ApiUser[];
  onClose:     () => void;
  onSubmitted: () => void;
}) {
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);
  const [approverOpen, setApproverOpen] = useState(false);
  const approverRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title:       permit.title       ?? "",
    description: permit.description ?? "",
    categoryId:  String(permit.categoryId ?? ""),
  });

  // Use approval.approver (name string from backend) directly
  const [selectedApprovers, setSelectedApprovers] = useState<SelectedApprover[]>(() =>
    (permit.approvals ?? [])
      .sort((a, b) => a.step_order - b.step_order)
      .map((a, i) => ({
        userId:    i,
        name:      a.approver ?? "",
        stepOrder: a.step_order,
      }))
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (approverRef.current && !approverRef.current.contains(e.target as Node))
        setApproverOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleApprover = (user: ApiUser) => {
    setSelectedApprovers((prev) => {
      const exists = prev.find((a) => a.userId === user.id);
      if (exists) return prev.filter((a) => a.userId !== user.id).map((a, i) => ({ ...a, stepOrder: i + 1 }));
      return [...prev, { userId: user.id, name: `${user.firstName} ${user.lastName}`, stepOrder: prev.length + 1 }];
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim())             return setError("Title is required.");
    if (!form.categoryId)               return setError("Please select a category.");
    if (selectedApprovers.length === 0) return setError("Please select at least one approver.");
    try {
      setSubmitting(true);
      const { data } = await api.post(`/permits/submit/${permit.id}`, {});
      if (data?.code !== 200) throw new Error(data?.message || "Failed to submit permit.");
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit.");
    } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
        <div className="w-full max-w-sm rounded-2xl flex flex-col items-center text-center space-y-4 p-8"
          style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(51,144,124,0.2)", border: "2px solid #33907c" }}>
            <Check size={28} className="text-[#33907c]" />
          </div>
          <div>
            <p className="font-bold text-base text-white mb-1">Permit Submitted!</p>
            <p className="text-sm" style={{ color: "var(--gv-text-muted)" }}>Now pending review by assigned approvers.</p>
          </div>
          {/* onSubmitted triggers a list refresh; onClose closes the modal */}
          <button onClick={() => { onSubmitted(); onClose(); }}
            className="gv-btn-brand px-8 py-2.5 rounded-xl text-sm font-semibold">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-lg max-h-[95vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
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
            {/* ✅ Cancel just closes — draft stays in the list untouched */}
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
            <input type="text" className="gv-input w-full text-sm" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
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
            <select value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="gv-input w-full text-sm" style={{ background: "var(--gv-glass-bg)", color: "white" }}>
              <option value="" style={{ background: "#0d1528" }}>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
              ))}
            </select>
          </div>

          <div ref={approverRef} className="relative">
            <label className="gv-eyebrow mb-1 block">Approvers *</label>
            <button type="button" onClick={() => setApproverOpen((p) => !p)}
              className="gv-input w-full text-sm flex items-center justify-between" style={{ color: "white" }}>
              <span className="truncate">
                {/* ✅ No step numbers — just names */}
                {selectedApprovers.length === 0
                  ? "Select approvers"
                  : selectedApprovers.map((a) => a.name).join(", ")}
              </span>
              <ChevronDown size={15} className={`ml-2 shrink-0 transition-transform ${approverOpen ? "rotate-180" : ""}`} />
            </button>
            {approverOpen && (
              <div className="absolute z-20 w-full rounded-xl shadow-xl flex flex-col"
                style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)", bottom: "calc(100% + 4px)" }}>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {users.length === 0 ? (
                    <p className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>No users available</p>
                  ) : users.map((u) => {
                    const sel = selectedApprovers.find((a) => a.userId === u.id);
                    return (
                      <button key={u.id} type="button" onClick={() => toggleApprover(u)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: sel ? "#33907c" : "white" }}>
                        <span className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                          style={sel ? { background: "#33907c" } : { border: "1px solid rgba(255,255,255,0.25)" }}>
                          {sel && <Check size={10} color="white" />}
                        </span>
                        <span>{u.firstName} {u.lastName}</span>
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

          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            Once submitted, the permit will be sent to approvers and cannot be edited.
          </div>

          <div className="flex gap-3 pt-1">
            {/* ✅ Cancel → only onClose, permit stays Draft in the list */}
            <button onClick={onClose} className="gv-btn-outline flex-1 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                : <><Send size={14} /> Submit for Approval</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Permit detail modal ──────────────────────────────────────────────────────

function PermitDetailModal({ selected, onClose }: {
  selected: PermitDetailWithRaw;
  onClose:  () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
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
          {/* ✅ Current Step removed from meta grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { label: "Requested By", value: selected.requester ?? "—" },
              { label: "Category",     value: selected.permitCategory ?? "—" },
              { label: "Site",         value: selected.siteName ?? "—" },
              { label: "Created",      value: fmtDate(selected.created_at) },
              { label: "Last Updated",  value: fmtDate(selected.updated_at) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="gv-eyebrow mb-0.5 text-[10px]">{label}</p>
                <p className="text-xs font-medium" style={{ color: "var(--gv-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>

          {selected.description && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--gv-glass-border)" }}>
              <p className="gv-eyebrow text-[10px] mb-1">Description</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--gv-text-muted)" }}>{selected.description}</p>
            </div>
          )}

          {/* Approvers table — Comment column only appears when at least one approval has a comment */}
          {selected.approvals?.length > 0 && (() => {
            const hasComment = selected.approvals.some((a) => a.comment);
            return (
              <div>
                <p className="gv-eyebrow text-[10px] mb-2">Approvers</p>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--gv-glass-border)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "rgba(51,144,124,0.08)" }}>
                        {["Approver", "Status", ...(hasComment ? ["Comment"] : [])].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider"
                            style={{ color: "#33907c", fontSize: "10px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.approvals.sort((a, b) => a.step_order - b.step_order).map((approval) => {
                        const ast = APPROVAL_STYLES[approval.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
                        return (
                          <tr key={approval.id} style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                            <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>{approval.approver ?? "—"}</td>
                            <td className="px-3 py-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: ast.bg, color: ast.color }}>{approval.status}</span>
                            </td>
                            {hasComment && (
                              <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>
                                {approval.comment ?? "—"}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = ["All", "Draft", "Pending", "In Review", "Approved", "Rejected"] as const;

const STAT_DEFS = [
  { label: "Total" },
  { label: "Pending" },
  { label: "Approved" },
  { label: "Rejected" },
];

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function PermitsDashboard() {
  const router    = useRouter();
  const role      = getRole();
  const isManager = MANAGER_ROLES.includes(role ?? "");
  const isFieldOp = role === FIELD_OPERATOR;

  const [activeTab,    setActiveTab]    = useState<"permits" | "categories">("permits");
  const [categories,   setCategories]   = useState<PermitCategory[]>([]);
  const [users,        setUsers]        = useState<ApiUser[]>([]);
  const [permits,      setPermits]      = useState<PermitListItem[]>([]);
  const [detailCache,  setDetailCache]  = useState<Record<number, PermitDetailWithRaw>>({});
  const [search,       setSearch]       = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [isLoading,    setIsLoading]    = useState(true);
  const [selected,     setSelected]     = useState<PermitDetailWithRaw | null>(null);
  const [draftEdit,    setDraftEdit]    = useState<PermitDetailWithRaw | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [permitsRes, catsRes, usersRes] = await Promise.all([
          api.get("/permits/my-pemits"),
          api.get("/permits/categories"),
          api.get("/users/list"),
        ]);
        const list: PermitListItem[] = permitsRes.data?.data?.items ?? permitsRes.data?.data ?? [];
        setPermits(list);
        const rawCats: any[] = catsRes.data?.data?.items ?? catsRes.data?.data ?? [];
        setCategories(rawCats.map(normaliseCategory));
        const up = usersRes.data?.data ?? usersRes.data;
        setUsers(Array.isArray(up) ? up : up?.items ?? []);
      } catch (err) { console.error(err); }
      finally {
        // ✅ Show the list immediately — don't wait for detail pre-fetches
        setIsLoading(false);
      }
    })();
  }, []);

  // Pre-fetch permit details in the background after the list renders
  // This runs without blocking the UI — tapping a row will open instantly once cached
  useEffect(() => {
    if (permits.length === 0) return;
    let cancelled = false;
    (async () => {
      const cache: Record<number, PermitDetailWithRaw> = {};
      await Promise.all(
        permits.map(async (p) => {
          try {
            const res = await api.get(`/permits/get/${p.id}`);
            if (res.data?.data) cache[p.id] = res.data.data as PermitDetailWithRaw;
          } catch { /* skip silently */ }
        })
      );
      if (!cancelled) setDetailCache(cache);
    })();
    return () => { cancelled = true; };
  }, [permits]);

  /** Only called after a successful submit — refreshes the list so Draft → Pending */
  const refresh = async () => {
    try {
      const { data } = await api.get("/permits/my-pemits");
      const list: PermitListItem[] = data?.data?.items ?? data?.data ?? [];
      setPermits(list);
      setDetailCache({});
    } catch (err) { console.error(err); }
  };

  const filtered = permits.filter((p) => {
    const matchStatus = activeStatus === "All" || p.status === activeStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q || p.title.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q));
  });

  const counts = permits.reduce(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }),
    {} as Record<string, number>
  );

  // All details are pre-fetched on load — opens instantly with no wait
  const openPermit = (permit: PermitListItem) => {
    const detail = detailCache[permit.id];
    if (!detail) return; // still loading silently, shouldn't normally happen
    detail.status === "Draft" ? setDraftEdit(detail) : setSelected(detail);
  };

  const statCounts = [
    permits.length,
    (counts["Pending"] || 0) + (counts["In Review"] || 0),
    counts["Approved"] || 0,
    counts["Rejected"] || 0,
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>
            {activeTab === "permits" ? "My Permits" : "Permit Categories"}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
            {activeTab === "permits"
              ? `${filtered.length} permit${filtered.length !== 1 ? "s" : ""}`
              : "Manage permit categories"}
          </p>
        </div>
        {activeTab === "permits" && isFieldOp && (
          <button onClick={() => router.push("/permits/create")}
            className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
            <Plus size={16} /> New Permit
          </button>
        )}
      </div>

      {isManager && (
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}>
          {([
            { key: "permits",    label: "Permits",    icon: <FileText size={14} /> },
            { key: "categories", label: "Categories", icon: <Tag size={14} /> },
          ] as const).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={activeTab === tab.key ? { background: "#33907c", color: "white" } : { color: "var(--gv-text-muted)" }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "categories" && <CategoriesTab />}

      {activeTab === "permits" && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
              : STAT_DEFS.map((s, i) => (
                  <StatCard key={s.label} label={s.label} count={statCounts[i]} />
                ))}
          </div>

          <div className="gv-card p-3!">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }} />
              <input type="text" placeholder="Search by title or category..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="gv-input pl-9! py-2! text-sm" />
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => {
              const count    = tab === "All" ? permits.length : (counts[tab] || 0);
              const isActive = activeStatus === tab;
              return (
                <button key={tab} onClick={() => setActiveStatus(tab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                  style={{
                    background: isActive ? "rgba(51,144,124,0.15)" : "var(--gv-glass-bg)",
                    color:      isActive ? "#33907c" : "var(--gv-text-muted)",
                    border:     `1px solid ${isActive ? "rgba(51,144,124,0.5)" : "var(--gv-glass-border)"}`,
                  }}>
                  {tab}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table — desktop: Step column removed */}
          <div className="gv-card p-0! overflow-hidden hidden md:block">
            {isLoading ? (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                    {["Title", "Category", "Status", "Date", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#33907c" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <FileText size={40} style={{ color: "var(--gv-text-faint)" }} />
                <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>
                  {search ? `No results for "${search}"` : activeStatus === "All" ? "No permits yet" : `No ${activeStatus} permits`}
                </p>
                {activeStatus === "All" && !search && isFieldOp && (
                  <button onClick={() => router.push("/permits/create")}
                    className="gv-btn-brand px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                    <Plus size={14} /> Create your first permit
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                    {/* ✅ Step column removed */}
                    {["Title", "Category", "Status", "Date", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#33907c" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((permit, idx) => (
                    <tr key={permit.id} onClick={() => openPermit(permit)} className="cursor-pointer"
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--gv-glass-border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gv-glass-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3 text-sm font-semibold max-w-xs truncate" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={permit.status} /></td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{fmtDate(permit.updated_at)}</td>
                      <td className="px-4 py-3">
                        {permit.status === "Draft" && (
                          <span className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 w-fit"
                            style={{ background: "rgba(51,144,124,0.15)", color: "#33907c" }}>
                            <Pencil size={11} /> Edit & Submit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Cards — mobile: Step removed */}
          <div className="space-y-2 md:hidden">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>
                  {activeStatus === "All" ? "No permits yet" : `No ${activeStatus} permits`}
                </p>
                {activeStatus === "All" && isFieldOp && (
                  <button onClick={() => router.push("/permits/create")} className="gv-btn-brand px-4 py-2 rounded-xl text-sm">
                    Create Permit
                  </button>
                )}
              </div>
            ) : filtered.map((permit) => {
              const st = STATUS_STYLES[permit.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
              return (
                <div key={permit.id} onClick={() => openPermit(permit)}
                  className="gv-card cursor-pointer active:scale-[0.99] transition-transform" style={{ padding: "14px 16px" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color }}>{permit.status}</span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</p>
                  <div className="flex items-center justify-between pt-2.5"
                    style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                    <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{fmtDate(permit.updated_at)}</span>
                    {permit.status === "Draft" && (
                      <span className="text-xs flex items-center gap-1" style={{ color: "#33907c" }}>
                        <Pencil size={10} /> Edit & Submit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {draftEdit && (
        <DraftEditModal
          permit={draftEdit}
          categories={categories}
          users={users}
          onClose={() => setDraftEdit(null)}        
          onSubmitted={refresh}                     
        />
      )}

      {selected && (
        <PermitDetailModal
          selected={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}