"use client";

import { useEffect, useState, useRef } from "react";
import { X, FileText, ChevronDown, Check } from "lucide-react";
import api from "@/lib/api";
import { fetchSites } from "@/lib/api/sites";

interface Site     { id: number; name: string; }
interface Category { id: number; name: string; }
interface ApiUser  { id: number; ref_id: string; firstName: string; lastName: string; }

// Selected approver with step order
interface SelectedApprover { userId: number; name: string; stepOrder: number; }

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

interface CreatePermitModalProps {
  onClose:   () => void;
  onSuccess: () => void;
}

export default function CreatePermitModal({ onClose, onSuccess }: CreatePermitModalProps) {
  const [sites, setSites]           = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers]           = useState<ApiUser[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [approverOpen, setApproverOpen] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<SelectedApprover[]>([]);
  const approverRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", siteId: "", categoryId: "",
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (approverRef.current && !approverRef.current.contains(e.target as Node)) {
        setApproverOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [sitesData, catsRes, usersRes] = await Promise.all([
          fetchSites(),
          api.get("/permits/categories"),
          api.get("/users/list"),
        ]);
        setSites(sitesData as unknown as Site[]);
        setCategories(unwrapArray<Category>(catsRes.data));

        const usersPayload = usersRes.data?.data ?? usersRes.data;
        const usersList: ApiUser[] = Array.isArray(usersPayload)
          ? usersPayload
          : usersPayload?.items ?? [];
        setUsers(usersList);
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const toggleApprover = (user: ApiUser) => {
    setSelectedApprovers((prev) => {
      const exists = prev.find((a) => a.userId === user.id);
      if (exists) {
        // Remove and re-assign step orders
        const updated = prev
          .filter((a) => a.userId !== user.id)
          .map((a, i) => ({ ...a, stepOrder: i + 1 }));
        return updated;
      } else {
        return [...prev, {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          stepOrder: prev.length + 1,
        }];
      }
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim())              return setError("Title is required.");
    if (!form.description.trim())        return setError("Description is required.");
    if (!form.categoryId)                return setError("Please select a category.");
    if (selectedApprovers.length === 0)  return setError("Please select at least one approver.");

    try {
      setSubmitting(true);
      const { data } = await api.post("/permits/create", {
        title:       form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.categoryId),
        approvers:   selectedApprovers.map((a) => ({
          approver_id: a.userId,
          step_order:  a.stepOrder,
        })),
      });
      if (data?.code !== 200) throw new Error(data?.message || "Failed to create permit.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create permit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl"
        style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><FileText size={18} className="text-[#33907c]" /></div>
            <h3 className="font-bold text-base" style={{ color: "var(--gv-text-primary)" }}>New Permit</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: "var(--gv-text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="gv-eyebrow mb-1 block">Title *</label>
            <input
              type="text"
              className="gv-input w-full text-sm"
              placeholder="e.g. Driving Permit for Site Visit"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="gv-eyebrow mb-1 block">Description *</label>
            <textarea
              className="gv-input w-full text-sm resize-none"
              rows={3}
              placeholder="Describe the purpose of this permit..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {/* Category (site_id not in PermitCreate DTO, removed) */}
          <div>
            <label className="gv-eyebrow mb-1 block">Category *</label>
            {loadingOptions ? (
              <div className="gv-input w-full h-10 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ) : (
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="gv-input w-full text-sm"
                style={{ background: "var(--gv-glass-bg)", color: form.categoryId ? "white" : "var(--gv-text-faint)" }}
              >
                <option value="" style={{ background: "#0d1528" }}>
                  {categories.length === 0 ? "No categories available" : "Select category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Approvers multi-select dropdown */}
          <div ref={approverRef} className="relative">
            <label className="gv-eyebrow mb-1 block">Approvers * <span style={{ color: "var(--gv-text-muted)", fontWeight: 400 }}></span></label>
            {loadingOptions ? (
              <div className="gv-input w-full h-10 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ) : (
              <>
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setApproverOpen((p) => !p)}
                  className="gv-input w-full text-sm flex items-center justify-between"
                  style={{ color: selectedApprovers.length ? "white" : "var(--gv-text-faint)" }}
                >
                  <span className="truncate">
                    {selectedApprovers.length === 0
                      ? "Select approvers"
                      : selectedApprovers.map((a) => `${a.stepOrder}. ${a.name}`).join(" → ")}
                  </span>
                  <ChevronDown size={15} className={`ml-2 flex-shrink-0 transition-transform ${approverOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {approverOpen && (
                  <div
                    className="absolute z-20 w-full rounded-xl shadow-xl flex flex-col"
                    style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)", bottom: "calc(100% + 4px)" }}
                  >
                    {/* Scrollable user list */}
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {users.length === 0 ? (
                        <p className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>No users available</p>
                      ) : (
                        users.map((u) => {
                          const selected = selectedApprovers.find((a) => a.userId === u.id);
                          return (
                            <button
                              key={u.id ?? u.ref_id}
                              type="button"
                              onClick={() => toggleApprover(u)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                              style={{ color: selected ? "#33907c" : "white" }}
                            >
                              <div className="flex items-center gap-2">
                                {selected && (
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: "#33907c", color: "white" }}>
                                    {selected.stepOrder}
                                  </span>
                                )}
                                {!selected && <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />}
                                <span>{u.firstName} {u.lastName}</span>
                              </div>
                              {selected && <Check size={14} />}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Done button */}
                    <div className="p-3" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                      <button
                        type="button"
                        onClick={() => setApproverOpen(false)}
                        className="w-full py-2 rounded-xl text-sm font-semibold"
                        style={{ background: "#33907c", color: "white" }}
                      >
                        Done {selectedApprovers.length > 0 && `(${selectedApprovers.length} selected)`}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loadingOptions}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              ) : (
                <><FileText size={15} /> Create Permit</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}