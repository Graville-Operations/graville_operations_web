"use client";

import { useEffect, useState } from "react";
import { Permit } from "@/types/permits";
import { X, FileText, Search, Loader2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Draft":              { bg: "rgba(255,255,255,0.08)",   color: "rgba(255,255,255,0.5)" },
  "Submitted":          { bg: "rgba(96,165,250,0.15)",    color: "#60a5fa" },
  "Under Review":       { bg: "rgba(251,191,36,0.15)",    color: "#fbbf24" },
  "Approved":           { bg: "rgba(51,144,124,0.15)",    color: "#33907c" },
  "Rejected":           { bg: "rgba(248,113,113,0.15)",   color: "#f87171" },
  "Revision Requested": { bg: "rgba(251,146,60,0.15)",    color: "#fb923c" },
};

const APPROVAL_STYLES: Record<string, { bg: string; color: string }> = {
  "Pending":  { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24" },
  "Approved": { bg: "rgba(51,144,124,0.15)",  color: "#33907c" },
  "Rejected": { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
};

function StatusBadge({ status }: { status: string }) {
  const st = STATUS_STYLES[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
      {status}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function PendingPermitsPage() {
  const [permits, setPermits]     = useState<Permit[]>([]);
  const [filtered, setFiltered]   = useState<Permit[]>([]);
  const [search, setSearch]       = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected]   = useState<Permit | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment]     = useState("");
  const [showActionPanel, setShowActionPanel] = useState(false);

  useEffect(() => { fetchPending(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      permits.filter((p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.requester.toLowerCase().includes(q) ||
        p.siteName.toLowerCase().includes(q)
      )
    );
  }, [search, permits]);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const res  = await fetch(`${BASE_URL}/api/v1/permits/pending`, { headers: getAuthHeaders() });
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : json.data?.data ?? json.data?.items ?? [];
      setPermits(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed to fetch pending permits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = async (permit: Permit) => {
    setSelected(permit);
    setDetailLoading(true);
    setShowActionPanel(false);
    setComment("");
    try {
      const res  = await fetch(`${BASE_URL}/api/v1/permits/get/${permit.id}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.code === 200) setSelected(json.data);
    } catch (err) {
      console.error("Failed to fetch permit detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const takeAction = async (action: "approve" | "reject" | "request_revision") => {
    if (!selected) return;
    try {
      setActionLoading(true);
      const res  = await fetch(`${BASE_URL}/api/v1/permits/take-action/${selected.id}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, comment }),
      });
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.message);
      setSelected(null);
      fetchPending();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>Pending Approvals</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
            {filtered.length} permit{filtered.length !== 1 ? "s" : ""} awaiting action
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="gv-card !p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }} />
          <input
            type="text"
            placeholder="Search by title, requester or site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input !pl-9 !py-2 text-sm"
          />
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                  {["Title", "Category", "Site", "Requester", "Step", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((permit, idx) => (
                  <tr
                    key={permit.id}
                    onClick={() => openDetail(permit)}
                    className="cursor-pointer"
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid var(--gv-glass-border)" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gv-glass-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{permit.permitCategory}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{permit.siteName}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{permit.requester}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>Step {permit.currentStep}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>
                      {new Date(permit.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="space-y-2 md:hidden">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <p className="text-sm" style={{ color: "var(--gv-text-subtle)" }}>No pending permits</p>
          </div>
        ) : (
          filtered.map((permit) => (
            <div
              key={permit.id}
              onClick={() => openDetail(permit)}
              className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: "14px 16px" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</span>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>Step {permit.currentStep}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{permit.requester}</p>
              <p className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{permit.siteName} · {permit.permitCategory}</p>
            </div>
          ))
        )}
      </div>

      {/* Detail + Action Modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div
            className="w-full md:max-w-xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
            style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}
          >
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="gv-icon-box !p-1.5"><FileText size={15} className="text-[#33907c]" /></div>
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ color: "var(--gv-text-primary)" }}>{selected.title}</p>
                  <p className="text-xs" style={{ color: "var(--gv-text-muted)" }}>{selected.permitCategory} · {selected.siteName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg" style={{ color: "var(--gv-text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 py-12" style={{ color: "var(--gv-text-muted)" }}>
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs">Loading details…</span>
              </div>
            ) : (
              <div className="p-5 space-y-4">

                {/* Details */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Requested By", value: selected.requester },
                    { label: "Current Step", value: `Step ${selected.currentStep}` },
                    { label: "Category",     value: selected.permitCategory },
                    { label: "Site",         value: selected.siteName },
                    { label: "Created",      value: new Date(selected.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) },
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

                {/* Approval chain */}
                {selected.approvals && selected.approvals.length > 0 && (
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
                                <td className="px-3 py-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: ast.bg, color: ast.color }}>{approval.status}</span>
                                </td>
                                <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>{approval.comment ?? "—"}</td>
                                <td className="px-3 py-2" style={{ color: "var(--gv-text-muted)" }}>
                                  {approval.actioned_at ? new Date(approval.actioned_at).toLocaleDateString() : "—"}
                                </td>
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
                    <button
                      onClick={() => setShowActionPanel(!showActionPanel)}
                      className="text-xs px-3 py-1 rounded-lg"
                      style={{ background: "rgba(51,144,124,0.15)", color: "#33907c" }}
                    >
                      {showActionPanel ? "Cancel" : "Act on this permit"}
                    </button>
                  </div>
                  {showActionPanel && (
                    <div className="space-y-3">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment (optional)..."
                        rows={2}
                        className="gv-input resize-none text-sm w-full"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => takeAction("approve")} disabled={actionLoading} className="flex-1 py-2 rounded-xl text-sm font-semibold gv-btn-brand disabled:opacity-50">
                          {actionLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Approve"}
                        </button>
                        <button onClick={() => takeAction("request_revision")} disabled={actionLoading} className="flex-1 py-2 rounded-xl text-sm font-semibold gv-btn-outline disabled:opacity-50">
                          Revise
                        </button>
                        <button
                          onClick={() => takeAction("reject")} disabled={actionLoading}
                          className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
                        >
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