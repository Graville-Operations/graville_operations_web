"use client";

import { useEffect, useState, useRef } from "react";
import { X, FileText, Loader2, Plus, Search, ChevronDown, Check, ArrowRight, Send, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  PermitListItem, PermitDetail, PermitCategory,
  STATUS_STYLES, APPROVAL_STYLES,
} from "@/types/permits";

interface ApiUser { id: number; firstName: string; lastName: string; }
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

function StatusBadge({ status }: { status: string }) {
  const st = STATUS_STYLES[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{status}</span>;
}

function Spinner() {
  return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" /></div>;
}

// ── Draft Edit & Submit Modal ──────────────────────────────────────────────────
function DraftEditModal({ permit, onClose, onSubmitted }: {
  permit: PermitDetail; onClose: () => void; onSubmitted: () => void;
}) {
  const [categories, setCategories] = useState<PermitCategory[]>([]);
  const [users, setUsers]           = useState<ApiUser[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [approverOpen, setApproverOpen] = useState(false);
  const approverRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title:       permit.title,
    description: permit.description,
    categoryId:  String(permit.categoryId),
  });

  const [selectedApprovers, setSelectedApprovers] = useState<SelectedApprover[]>(
    permit.approvals
      ? permit.approvals
          .sort((a, b) => a.step_order - b.step_order)
          .map((a) => ({ userId: a.approver_id, name: `Approver ${a.approver_id}`, stepOrder: a.step_order }))
      : []
  );

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
        setLoadingOptions(true);
        const [catsRes, usersRes] = await Promise.all([
          api.get("/permits/categories"),
          api.get("/users/list"),
        ]);
        setCategories(unwrapArray<PermitCategory>(catsRes.data));
        const up = usersRes.data?.data ?? usersRes.data;
        const userList: ApiUser[] = Array.isArray(up) ? up : up?.items ?? [];
        setUsers(userList);
        // Replace approver IDs with real names
        setSelectedApprovers((prev) =>
          prev.map((a) => {
            const user = userList.find((u) => u.id === a.userId);
            return user ? { ...a, name: `${user.firstName} ${user.lastName}` } : a;
          })
        );
      } catch (e) { console.error(e); }
      finally { setLoadingOptions(false); }
    })();
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
    if (!form.description.trim())       return setError("Description is required.");
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
        <div className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center space-y-4"
          style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(51,144,124,0.2)", border: "2px solid #33907c" }}>
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
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-lg max-h-[95vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>

        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><Pencil size={16} className="text-[#33907c]" /></div>
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--gv-text-primary)" }}>Edit & Submit</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--gv-text-muted)" }}>Review your draft and submit for approval</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>Draft</span>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}><X size={16} /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="gv-eyebrow mb-1 block">Title *</label>
            <input type="text" className="gv-input w-full text-sm" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">Description *</label>
            <textarea className="gv-input w-full text-sm resize-none" rows={3} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">Category *</label>
            {loadingOptions ? (
              <div className="gv-input w-full h-10 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ) : (
              <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="gv-input w-full text-sm"
                style={{ background: "var(--gv-glass-bg)", color: form.categoryId ? "white" : "var(--gv-text-faint)" }}>
                <option value="" style={{ background: "#0d1528" }}>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: "#0d1528", color: "#fff" }}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div ref={approverRef} className="relative">
            <label className="gv-eyebrow mb-1 block">Approvers * <span style={{ color: "var(--gv-text-muted)", fontWeight: 400 }}>(in approval order)</span></label>
            {loadingOptions ? (
              <div className="gv-input w-full h-10 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ) : (
              <>
                <button type="button" onClick={() => setApproverOpen((p) => !p)}
                  className="gv-input w-full text-sm flex items-center justify-between"
                  style={{ color: selectedApprovers.length ? "white" : "var(--gv-text-faint)" }}>
                  <span className="truncate">
                    {selectedApprovers.length === 0 ? "Select approvers in order"
                      : selectedApprovers.map((a) => `${a.stepOrder}. ${a.name}`).join(" → ")}
                  </span>
                  <ChevronDown size={15} className={`ml-2 flex-shrink-0 transition-transform ${approverOpen ? "rotate-180" : ""}`} />
                </button>
                {approverOpen && (
                  <div className="absolute z-20 w-full rounded-xl shadow-xl flex flex-col"
                    style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)", bottom: "calc(100% + 4px)" }}>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {users.map((u) => {
                        const sel = selectedApprovers.find((a) => a.userId === u.id);
                        return (
                          <button key={u.id} type="button" onClick={() => toggleApprover(u)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: sel ? "#33907c" : "white" }}>
                            <div className="flex items-center gap-2">
                              {sel ? (
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: "#33907c", color: "white" }}>{sel.stepOrder}</span>
                              ) : (
                                <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
                              )}
                              <span>{u.firstName} {u.lastName}</span>
                            </div>
                            {sel && <Check size={14} />}
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
              </>
            )}
          </div>

          <div className="rounded-xl px-4 py-3 text-xs"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            Once submitted, the permit will be sent to approvers and cannot be edited.
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || loadingOptions}
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

// ── Read-only Detail Modal ─────────────────────────────────────────────────────
function PermitDetailModal({ selected, onClose }: { selected: PermitDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="gv-icon-box !p-1.5"><FileText size={15} className="text-[#33907c]" /></div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: "var(--gv-text-primary)" }}>{selected.title}</p>
              <p className="text-xs" style={{ color: "var(--gv-text-muted)" }}>{selected.permitCategory ?? "—"} · {selected.siteName ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selected.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}><X size={16} /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { label: "Requested By", value: selected.requester ?? "—" },
              { label: "Current Step", value: `Step ${selected.currentStep}` },
              { label: "Category",     value: selected.permitCategory ?? "—" },
              { label: "Site",         value: selected.siteName ?? "—" },
              { label: "Created",      value: selected.created_at ? new Date(selected.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—" },
              { label: "Updated",      value: selected.updated_at ? new Date(selected.updated_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="gv-eyebrow mb-0.5 text-[10px]">{label}</p>
                <p className="text-xs font-medium" style={{ color: "var(--gv-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
          {selected.description && (
            <div className="rounded-xl px-4 py-3" style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}>
              <p className="gv-eyebrow text-[10px] mb-1">Description</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--gv-text-muted)" }}>{selected.description}</p>
            </div>
          )}
          {selected.approvals?.length > 0 && (
            <div>
              <p className="gv-eyebrow text-[10px] mb-2">Approval Chain</p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--gv-glass-border)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "rgba(51,144,124,0.08)" }}>
                      {["Step", "Status", "Comment", "Date"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#33907c", fontSize: "10px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.approvals.sort((a, b) => a.step_order - b.step_order).map((approval) => {
                      const ast = APPROVAL_STYLES[approval.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
                      return (
                        <tr key={approval.id} style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                          <td className="px-3 py-2" style={{ color: "var(--gv-text-primary)" }}>Step {approval.step_order}</td>
                          <td className="px-3 py-2"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: ast.bg, color: ast.color }}>{approval.status}</span></td>
                          <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>{approval.comment ?? "—"}</td>
                          <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>{approval.actioned_at ? new Date(approval.actioned_at).toLocaleDateString() : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_TABS = ["All", "Draft", "Pending", "In Review", "Approved", "Rejected"] as const;

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function PermitsDashboard() {
  const router = useRouter();

  const [permits, setPermits]           = useState<PermitListItem[]>([]);
  // Cache all permit details fetched so far — no re-fetching on re-click
  const [detailCache, setDetailCache]   = useState<Record<number, PermitDetail>>({});
  const [search, setSearch]             = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [isLoading, setIsLoading]       = useState(true);
  const [selected, setSelected]         = useState<PermitDetail | null>(null);
  const [draftEdit, setDraftEdit]       = useState<PermitDetail | null>(null);
  // Track which IDs are currently being fetched to avoid duplicate calls
  const fetchingRef = useRef<Set<number>>(new Set());

  useEffect(() => { fetchMyPermits(); }, []);

  const fetchMyPermits = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/permits/my-pemits");
      const list: PermitListItem[] = data?.data?.items ?? data?.data ?? [];
      setPermits(list);
      // Pre-fetch all details in background so clicks are instant
      prefetchAll(list);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // Silently pre-fetch all permit details in parallel
  const prefetchAll = async (list: PermitListItem[]) => {
    await Promise.all(list.map(async (p) => {
      if (fetchingRef.current.has(p.id)) return;
      fetchingRef.current.add(p.id);
      try {
        const { data } = await api.get(`/permits/get/${p.id}`);
        if (data?.data) {
          setDetailCache((prev) => ({ ...prev, [p.id]: data.data }));
        }
      } catch { /* silent */ }
    }));
  };

  const filtered = permits.filter((p) => {
    const matchStatus = activeStatus === "All" || p.status === activeStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = permits.reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {} as Record<string, number>);

  // Open permit — use cache, no loading state needed
  const openPermit = (permit: PermitListItem) => {
    const detail = detailCache[permit.id];
    if (!detail) {
      // Still loading — fetch inline (rare case)
      api.get(`/permits/get/${permit.id}`).then(({ data }) => {
        if (data?.data) {
          setDetailCache((prev) => ({ ...prev, [permit.id]: data.data }));
          if (data.data.status === "Draft") setDraftEdit(data.data);
          else setSelected(data.data);
        }
      });
      return;
    }
    if (detail.status === "Draft") setDraftEdit(detail);
    else setSelected(detail);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>My Permits</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
            {filtered.length} permit{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => router.push("/permits/create")}
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={16} /> New Permit
        </button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    count: permits.length,                                        color: "bg-white/20" },
            { label: "Pending",  count: (counts["Pending"] || 0) + (counts["In Review"] || 0), color: "bg-blue-400/20" },
            { label: "Approved", count: counts["Approved"] || 0,                               color: "bg-[#33907c]/30" },
            { label: "Rejected", count: counts["Rejected"] || 0,                               color: "bg-red-500/20" },
          ].map((s) => (
            <div key={s.label} className="gv-card gv-stat-card">
              <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
              <p className="text-2xl font-semibold text-white">{s.count}</p>
              <p className="text-xs" style={{ color: "var(--gv-text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="gv-card !p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }} />
          <input type="text" placeholder="Search by title or category..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="gv-input !pl-9 !py-2 text-sm" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const count = tab === "All" ? permits.length : (counts[tab] || 0);
          const isActive = activeStatus === tab;
          return (
            <button key={tab} onClick={() => setActiveStatus(tab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={isActive
                ? { background: "#33907c", color: "white" }
                : { background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}>
              {tab}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table — desktop */}
      <div className="gv-card !p-0 overflow-hidden hidden md:block">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <FileText size={40} style={{ color: "var(--gv-text-faint)" }} />
            <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>
              {search ? `No results for "${search}"` : activeStatus === "All" ? "No permits yet" : `No ${activeStatus} permits`}
            </p>
            {activeStatus === "All" && !search && (
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
                {["Title", "Category", "Step", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
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
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>Step {permit.current_step}</td>
                  <td className="px-4 py-3"><StatusBadge status={permit.status} /></td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>
                    {new Date(permit.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
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

      {/* Cards — mobile */}
      <div className="space-y-2 md:hidden">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>
              {activeStatus === "All" ? "No permits yet" : `No ${activeStatus} permits`}
            </p>
            {activeStatus === "All" && (
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
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{permit.status}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</p>
              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>
                  {new Date(permit.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {permit.status === "Draft" ? (
                  <span className="text-xs flex items-center gap-1" style={{ color: "#33907c" }}>
                    <Pencil size={10} /> Edit & Submit
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>Step {permit.current_step}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Draft Edit Modal */}
      {draftEdit && (
        <DraftEditModal
          permit={draftEdit}
          onClose={() => setDraftEdit(null)}
          onSubmitted={() => {
            setDetailCache({});
            fetchMyPermits();
          }}
        />
      )}

      {/* Read-only Detail Modal */}
      {selected && (
        <PermitDetailModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
