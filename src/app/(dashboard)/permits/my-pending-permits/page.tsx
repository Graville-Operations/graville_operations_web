"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileText, Search } from "lucide-react";
import EmptyState from "@/components/ui/emptystate";
import { Bone, ShimmerStyle } from "@/components/shared/Shimmer";
import { StatusBadge } from "@/components/permits/shared/StatusBadge";
import { RejectConfirmModal } from "@/components/permits/RejectConfirmModal";
import { PendingApprovalDetailModal } from "@/components/permits/PendingApprovalDetailModal";
import { usePendingApprovals } from "@/hooks/permits/usePendingApprovals";
import { formatPermitDate } from "@/lib/utils/permit-date";
import { STATUS_STYLES } from "@/types/permits";

export default function PendingApprovalsPage() {
  const {
    isLoading, search, setSearch, filtered, permitCache,
    selected, openDetail, closeDetail,
    actionLoading, actionError,
    showRejectModal, rejectComment, setRejectComment,
    approveComment, setApproveComment,
    approve, openReject, confirmReject, cancelReject,
  } = usePendingApprovals();

  return (
    <div className="space-y-6">
      <ShimmerStyle />
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>Pending Approvals</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
          {filtered.length} permit{filtered.length !== 1 ? "s" : ""} awaiting your action
        </p>
      </div>
      <div className="gv-card p-3!">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }} />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input pl-9! py-2! text-sm"
          />
        </div>
      </div>
      <div className="gv-card p-0! overflow-hidden hidden md:block">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Title", "Category", "Site", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
                  <td className="px-4 py-3"><Bone w="8rem" /></td>
                  <td className="px-4 py-3"><Bone w="5rem" /></td>
                  <td className="px-4 py-3"><Bone w="5rem" /></td>
                  <td className="px-4 py-3"><Bone w="4rem" h="1.25rem" style={{ borderRadius: "9999px" }} /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? `No results for "${search}"` : "No pending permits"}
            description={search ? "Try a different search term." : "Permits awaiting your approval will show up here."}
            fullScreen={false}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Title", "Category", "Site", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const detail = permitCache[item.permit_id];
                return (
                  <tr
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className="cursor-pointer"
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--gv-glass-border)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gv-glass-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3 text-sm font-semibold max-w-xs truncate" style={{ color: "var(--gv-text-primary)" }}>{detail?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{detail?.permitCategory ?? "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{detail?.siteName ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{formatPermitDate(item.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="space-y-2 md:hidden">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="gv-card" style={{ padding: "14px 16px" }}>
                <div className="flex items-center justify-between mb-2">
                  <Bone w="7rem" />
                  <Bone w="4rem" h="1.25rem" style={{ borderRadius: "9999px" }} />
                </div>
                <Bone w="5rem" h="0.75rem" style={{ marginBottom: "0.75rem" }} />
                <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                  <Bone w="4rem" h="0.75rem" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No pending permits"
            description="Permits awaiting your approval will show up here."
            fullScreen={false}
          />
        ) : filtered.map((item) => {
          const detail = permitCache[item.permit_id];
          const st = STATUS_STYLES[item.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
          return (
            <div key={item.id} onClick={() => openDetail(item)} className="gv-card cursor-pointer active:scale-[0.99] transition-transform" style={{ padding: "14px 16px" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{detail?.title ?? "—"}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{item.status}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{detail?.permitCategory ?? "—"}</p>
              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{formatPermitDate(item.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showRejectModal && (
        <RejectConfirmModal
          comment={rejectComment}
          setComment={setRejectComment}
          loading={actionLoading}
          onCancel={cancelReject}
          onConfirm={confirmReject}
        />
      )}

      {selected && (
        <PendingApprovalDetailModal
          selected={selected}
          onClose={closeDetail}
          onApprove={approve}
          onReject={openReject}
          actionLoading={actionLoading}
          actionError={actionError}
          approveComment={approveComment}
          setApproveComment={setApproveComment}
        />
      )}
    </div>
  );
}