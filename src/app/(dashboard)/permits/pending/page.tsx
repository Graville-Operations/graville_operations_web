"use client";

import { useEffect, useState } from "react";
import { X, FileText, Search, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import {
  PendingApprovalItem, PermitDetail,
  STATUS_STYLES, APPROVAL_STYLES,
} from "@/types/permits";

function StatusBadge({ status }: { status: string }) {
  const st = STATUS_STYLES[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{status}</span>;
}

function Spinner() {
  return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" /></div>;
}

// ── Reject Confirmation Modal ──────────────────────────────────────────────────
function RejectConfirmModal({ onConfirm, onCancel, loading, comment, setComment }: {
  onConfirm: () => void; onCancel: () => void; loading: boolean;
  comment: string; setComment: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "#0d1528", border: "1px solid rgba(248,113,113,0.3)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(248,113,113,0.15)" }}>
            <AlertTriangle size={18} style={{ color: "#f87171" }} />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Reject this permit?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gv-text-muted)" }}>This action cannot be undone.</p>
          </div>
        </div>
        <div>
          <label className="gv-eyebrow mb-1 block">Reason for rejection *</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this permit is being rejected..." rows={3}
            className="gv-input resize-none text-sm w-full" autoFocus />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--gv-glass-bg)", color: "var(--gv-text-muted)", border: "1px solid var(--gv-glass-border)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading || !comment.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
            {loading
              ? <><div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Rejecting...</>
              : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PendingApprovalsPage() {
  const [approvals, setApprovals]     = useState<PendingApprovalItem[]>([]);
  const [permitCache, setPermitCache] = useState<Record<number, PermitDetail>>({});
  const [search, setSearch]           = useState("");
  const [isLoading, setIsLoading]     = useState(true);
  const [selected, setSelected]       = useState<PermitDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment]         = useState("");
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment]     = useState("");

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/permits/pending");
      const list: PendingApprovalItem[] = data?.data?.items ?? data?.data ?? [];
      setApprovals(list);
      // Pre-fetch permit details for all items
      const details: Record<number, PermitDetail> = {};
      await Promise.all(list.map(async (item) => {
        try {
          const res = await api.get(`/permits/get/${item.permit_id}`);
          if (res.data?.data) details[item.permit_id] = res.data.data;
        } catch { }
      }));
      setPermitCache(details);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const filtered = approvals.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const d = permitCache[a.permit_id];
    return d?.title?.toLowerCase().includes(q) || d?.permitCategory?.toLowerCase().includes(q);
  });

  const openDetail = async (item: PendingApprovalItem) => {
    setShowActionPanel(false);
    setComment("");
    if (permitCache[item.permit_id]) { setSelected(permitCache[item.permit_id]); return; }
    setSelected({} as PermitDetail);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/permits/get/${item.permit_id}`);
      if (data?.data) {
        setSelected(data.data);
        setPermitCache((p) => ({ ...p, [item.permit_id]: data.data }));
      }
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const takeAction = async (action: "APPROVED" | "REJECTED", commentText: string) => {
    if (!selected) return;
    try {
      setActionLoading(true);
      const { data } = await api.post(`/permits/take-action/${selected.id}`, {
        status: action, comment: commentText || null,
      });
      if (data?.code !== 200) throw new Error(data?.message || "Action failed");
      setSelected(null);
      setShowRejectModal(false);
      setRejectComment("");
      fetchPending();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Action failed");
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>Pending Approvals</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
          {filtered.length} permit{filtered.length !== 1 ? "s" : ""} awaiting your action
        </p>
      </div>

      {/* Search */}
      <div className="gv-card !p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }} />
          <input type="text" placeholder="Search by title or category..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="gv-input !pl-9 !py-2 text-sm" />
        </div>
      </div>

      {/* Table — desktop */}
      <div className="gv-card !p-0 overflow-hidden hidden md:block">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <FileText size={40} style={{ color: "var(--gv-text-faint)" }} className="mb-3" />
            <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>
              {search ? `No results for "${search}"` : "No pending permits — all caught up!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Title", "Category", "Site", "Step", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const detail = permitCache[item.permit_id];
                return (
                  <tr key={item.id} onClick={() => openDetail(item)} className="cursor-pointer"
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--gv-glass-border)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gv-glass-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3 text-sm font-semibold max-w-xs truncate" style={{ color: "var(--gv-text-primary)" }}>
                      {detail?.title ?? <span className="text-xs animate-pulse" style={{ color: "var(--gv-text-muted)" }}>Loading...</span>}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{detail?.permitCategory ?? "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{detail?.siteName ?? "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>Step {item.step_order}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>
                      {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="space-y-2 md:hidden">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>No pending permits</p>
          </div>
        ) : filtered.map((item) => {
          const detail = permitCache[item.permit_id];
          const st = STATUS_STYLES[item.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
          return (
            <div key={item.id} onClick={() => openDetail(item)}
              className="gv-card cursor-pointer active:scale-[0.99] transition-transform" style={{ padding: "14px 16px" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{detail?.title ?? "Loading..."}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{item.status}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{detail?.permitCategory ?? "—"}</p>
              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>
                  {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>Step {item.step_order}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <RejectConfirmModal
          comment={rejectComment} setComment={setRejectComment} loading={actionLoading}
          onCancel={() => { setShowRejectModal(false); setRejectComment(""); }}
          onConfirm={() => takeAction("REJECTED", rejectComment)}
        />
      )}

      {/* Detail + Action Modal */}
      {selected && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="w-full md:max-w-xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
            style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="gv-icon-box !p-1.5"><FileText size={15} className="text-[#33907c]" /></div>
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ color: "var(--gv-text-primary)" }}>
                    {detailLoading ? "Loading..." : selected.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--gv-text-muted)" }}>
                    {detailLoading ? "—" : `${selected.permitCategory ?? "—"} · ${selected.siteName ?? "—"}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.status && <StatusBadge status={selected.status} />}
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}><X size={16} /></button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 py-12" style={{ color: "var(--gv-text-muted)" }}>
                <Loader2 size={14} className="animate-spin" /><span className="text-xs">Loading details…</span>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Requested By", value: selected.requester ?? "—" },
                    { label: "Current Step", value: `Step ${selected.currentStep}` },
                    { label: "Category",     value: selected.permitCategory ?? "—" },
                    { label: "Site",         value: selected.siteName ?? "—" },
                    { label: "Created",      value: selected.created_at ? new Date(selected.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—" },
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

                {/* Action panel */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold" style={{ color: "var(--gv-text-primary)" }}>Take Action</p>
                    <button onClick={() => setShowActionPanel(!showActionPanel)}
                      className="text-xs px-3 py-1 rounded-lg" style={{ background: "rgba(51,144,124,0.15)", color: "#33907c" }}>
                      {showActionPanel ? "Cancel" : "Act on this permit"}
                    </button>
                  </div>
                  {showActionPanel && (
                    <div className="space-y-3">
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment for approval (optional)..." rows={2}
                        className="gv-input resize-none text-sm w-full" />
                      <div className="flex gap-2">
                        <button onClick={() => takeAction("APPROVED", comment)} disabled={actionLoading}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold gv-btn-brand disabled:opacity-50">
                          {actionLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Approve"}
                        </button>
                        <button onClick={() => { setRejectComment(""); setShowRejectModal(true); }} disabled={actionLoading}
                          className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}