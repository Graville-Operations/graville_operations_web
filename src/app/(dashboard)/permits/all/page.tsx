"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Search, FileText } from "lucide-react";
import EmptyState from "@/components/ui/emptystate";
import { Bone, ShimmerStyle } from "@/components/shared/Shimmer";
import { StatusBadge } from "@/components/permits/shared/StatusBadge";
import { PermitDetailModal } from "@/components/permits/PermitDetailModal";
import { useAllPermits, STATUS_TABS } from "@/hooks/permits/useAllPermits";
import { formatPermitDate } from "@/lib/utils/permit-date";
import { STATUS_STYLES } from "@/types/permits";

export default function AllPermitsPage() {
  const {
    isLoading, loadError,
    search, setSearch,
    activeStatus, setActiveStatus,
    filtered, total, skip, limit,
    nextPage, prevPage,
    selected, setSelected,
    openPermit, openError,
  } = useAllPermits();

  return (
    <div className="space-y-6">
      <ShimmerStyle />

      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gv-text-primary)" }}>All Permits</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--gv-text-muted)" }}>
          {total} permit{total !== 1 ? "s" : ""} across the company
        </p>
      </div>

      {(loadError || openError) && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
        >
          {loadError || openError}
        </div>
      )}

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

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
            style={{
              background: activeStatus === tab ? "rgba(51,144,124,0.15)" : "var(--gv-glass-bg)",
              color: activeStatus === tab ? "#33907c" : "var(--gv-text-muted)",
              border: `1px solid ${activeStatus === tab ? "rgba(51,144,124,0.5)" : "var(--gv-glass-border)"}`,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table — desktop */}
      <div className="gv-card p-0! overflow-hidden hidden md:block">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Title", "Category", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
                  <td className="px-4 py-3"><Bone w="8rem" /></td>
                  <td className="px-4 py-3"><Bone w="5rem" /></td>
                  <td className="px-4 py-3"><Bone w="4rem" h="1.25rem" style={{ borderRadius: "9999px" }} /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? `No results for "${search}"` : "No permits found"}
            description={search ? "Try a different search term." : "Permits created across the company will show up here."}
            fullScreen={false}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Title", "Category", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((permit, idx) => (
                <tr
                  key={permit.id}
                  onClick={() => openPermit(permit)}
                  className="cursor-pointer"
                  style={{
                    borderBottom: idx < filtered.length - 1 ? "1px solid var(--gv-glass-border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gv-glass-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3 text-sm font-semibold max-w-xs truncate" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={permit.status} /></td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{formatPermitDate(permit.updated_at)}</td>
                </tr>
              ))}
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
                <Bone w="5rem" h="0.75rem" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No permits found"
            description="Permits created across the company will show up here."
            fullScreen={false}
          />
        ) : filtered.map((permit) => {
          const st = STATUS_STYLES[permit.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
          return (
            <div
              key={permit.id}
              onClick={() => openPermit(permit)}
              className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: "14px 16px" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{permit.status}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</p>
              <p className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{formatPermitDate(permit.updated_at)}</p>
            </div>
          );
        })}
      </div>

      {!isLoading && total > limit && (
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--gv-text-muted)" }}>
          <span>
            Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={skip === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={skip + limit >= total}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selected && (
        <PermitDetailModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}