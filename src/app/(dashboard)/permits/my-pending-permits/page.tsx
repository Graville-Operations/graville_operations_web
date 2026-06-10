"use client";

import { useEffect, useState } from "react";
import { X, FileText, Search, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import {
  PendingApprovalItem, PermitDetail,
  STATUS_STYLES, APPROVAL_STYLES,
} from "@/types/permits";

interface RawApproval {
  id:          number;
  permit_id:   number;
  approver:    string;  
  step_order:  number;
  status:      string;
  comment:     string | null;
  actioned_at: string | null;
  created_at:  string;
}

interface PermitDetailWithRaw extends Omit<PermitDetail, "approvals"> {
  approvals: RawApproval[];
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }
  return val;
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

function RejectConfirmModal({ onConfirm, onCancel, loading, comment, setComment }: {
  onConfirm:  () => void;
  onCancel:   () => void;
  loading:    boolean;
  comment:    string;
  setComment: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-60 p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "#0d1528", border: "1px solid rgba(248,113,113,0.3)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
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
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this permit is being rejected..."
            rows={3}
            className="gv-input resize-none text-sm w-full"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
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
export default function PendingApprovalsPage() {
  const [approvals,    setApprovals]    = useState<PendingApprovalItem[]>([]);
  const [permitCache,  setPermitCache]  = useState<Record<number, PermitDetailWithRaw>>({});
  const [search,       setSearch]       = useState("");
  const [isLoading,    setIsLoading]    = useState(true);
  const [selected,     setSelected]     = useState<PermitDetailWithRaw | null>(null);
  const [actionLoading,setActionLoading]= useState(false);
  const [actionError,  setActionError]  = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment,   setRejectComment]   = useState("");

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/permits/pending");
      const list: PendingApprovalItem[] = data?.data?.items ?? data?.data ?? [];
      setApprovals(list);
      // Pre-fetch all permit details so clicking a row opens instantly
      const details: Record<number, PermitDetailWithRaw> = {};
      await Promise.all(
        list.map(async (item) => {
          try {
            const res = await api.get(`/permits/get/${item.permit_id}`);
            if (res.data?.data) details[item.permit_id] = res.data.data as PermitDetailWithRaw;
          } catch { /* skip silently */ }
        })
      );
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

  const openDetail = (item: PendingApprovalItem) => {
    const detail = permitCache[item.permit_id];
    if (!detail) return;
    setActionError(null);
    setSelected(detail);
  };

  const closeDetail = () => {
    setSelected(null);
    setActionError(null);
    setShowRejectModal(false);
    setRejectComment("");
  };

  const takeAction = async (action: "APPROVED" | "REJECTED", commentText?: string) => {
    if (!selected) return;
    setActionError(null);
    try {
      setActionLoading(true);
      const { data } = await api.post(`/permits/take-action/${selected.id}`, {
        status:  action,
        comment: commentText || null,
      });
      if (data?.code !== 200) throw new Error(data?.message || "Action failed");
      closeDetail();
      fetchPending();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || "Action failed. Please try again.");
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
      <div className="gv-card p-3!">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }} />
          <input type="text" placeholder="Search by title or category..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="gv-input pl-9! py-2! text-sm" />
        </div>
      </div>

      {/* Table — desktop — Step column removed */}
      <div className="gv-card p-0! overflow-hidden hidden md:block">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <FileText size={40} style={{ color: "var(--gv-text-faint)" }} className="mb-3" />
            <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>
              {search ? `No results for "${search}"` : "No pending permits!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Title", "Category", "Site", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#33907c" }}>{h}</th>
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
                      {detail?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{detail?.permitCategory ?? "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{detail?.siteName ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>
                      {fmtDate(item.created_at)}
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
                <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{detail?.title ?? "—"}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: st.bg, color: st.color }}>{item.status}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{detail?.permitCategory ?? "—"}</p>
              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{fmtDate(item.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject confirm modal */}
      {showRejectModal && (
        <RejectConfirmModal
          comment={rejectComment}
          setComment={setRejectComment}
          loading={actionLoading}
          onCancel={() => { setShowRejectModal(false); setRejectComment(""); }}
          onConfirm={() => takeAction("REJECTED", rejectComment)}
        />
      )}
      {selected && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}>
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
                {selected.status && <StatusBadge status={selected.status} />}
                <button onClick={closeDetail} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Requested By", value: selected.requester ?? "—" },
                  { label: "Category",     value: selected.permitCategory ?? "—" },
                  { label: "Site",         value: selected.siteName ?? "—" },
                  { label: "Created",      value: fmtDate(selected.created_at) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="gv-eyebrow mb-0.5 text-[10px]">{label}</p>
                    <p className="text-xs font-medium" style={{ color: "var(--gv-text-primary)" }}>{value}</p>
                  </div>
                ))}
              </div>

              {selected.description && (
                <div className="rounded-xl px-4 py-3"
                  style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}>
                  <p className="gv-eyebrow text-[10px] mb-1">Description</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--gv-text-muted)" }}>{selected.description}</p>
                </div>
              )}

              {/* Approvers — Comment column only shows when at least one approval has a comment */}
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
                          {selected.approvals
                            .sort((a, b) => a.step_order - b.step_order)
                            .map((approval) => {
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

              {/* Inline error */}
              {actionError && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                  {actionError}
                </div>
              )}
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--gv-text-primary)" }}>Take Action</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => takeAction("APPROVED")}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand disabled:opacity-50 flex items-center justify-center">
                    {actionLoading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : "Approve"}
                  </button>
                  <button
                    onClick={() => { setRejectComment(""); setShowRejectModal(true); }}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                    style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                    Reject
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}