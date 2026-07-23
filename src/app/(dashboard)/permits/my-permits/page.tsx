"use client";

import { useRouter } from "next/navigation";
import { Plus, FileText, Tag, Pencil, Search } from "lucide-react";
import EmptyState from "@/components/ui/emptystate";
import { Bone, ShimmerStyle } from "@/components/shared/Shimmer";
import { StatusBadge } from "@/components/permits/shared/StatusBadge";
import { PlainStatCard } from "@/components/permits/shared/PlainStatCard";
import { CategoriesTab } from "@/components/permits/CategoriesTab";
import { DraftEditModal } from "@/components/permits/DraftEditModal";
import { PermitDetailModal } from "@/components/permits/PermitDetailModal";
import { usePermitsList, STATUS_TABS } from "@/hooks/permits/usePermitsList";
import { formatPermitDate } from "@/lib/utils/permit-date";
import { STATUS_STYLES } from "@/types/permits";

const STAT_DEFS = [
  { label: "Total" },
  { label: "Pending" },
  { label: "Approved" },
  { label: "Rejected" },
];

export default function PermitsDashboard() {
  const router = useRouter();
  const {
    isManager, isFieldOp,
    activeTab, setActiveTab,
    isLoading,
    search, setSearch,
    activeStatus, setActiveStatus,
    selected, setSelected,
    draftEdit, setDraftEdit,
    filtered, counts, statCounts, totalCount,
    openPermit, refresh,
    categories, users,
  } = usePermitsList();

  return (
    <div className="space-y-6">
      <ShimmerStyle />

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
          <button onClick={() => router.push("/permits/create")} className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
            <Plus size={16} /> New Permit
          </button>
        )}
      </div>

      {isManager && (
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--gv-glass-bg)", border: "1px solid var(--gv-glass-border)" }}>
          {([
            { key: "permits", label: "Permits", icon: <FileText size={14} /> },
            { key: "categories", label: "Categories", icon: <Tag size={14} /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={activeTab === tab.key ? { background: "#33907c", color: "white" } : { color: "var(--gv-text-muted)" }}
            >
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
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="gv-card gv-stat-card">
                    <Bone w="3rem" h="2.25rem" style={{ marginBottom: "0.5rem" }} />
                    <Bone w="3.5rem" h="0.75rem" />
                  </div>
                ))
              : STAT_DEFS.map((s, i) => (
                  <PlainStatCard key={s.label} label={s.label} count={statCounts[i]} />
                ))}
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

          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => {
              const count = tab === "All" ? totalCount : (counts[tab] || 0);
              const isActive = activeStatus === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveStatus(tab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                  style={{
                    background: isActive ? "rgba(51,144,124,0.15)" : "var(--gv-glass-bg)",
                    color: isActive ? "#33907c" : "var(--gv-text-muted)",
                    border: `1px solid ${isActive ? "rgba(51,144,124,0.5)" : "var(--gv-glass-border)"}`,
                  }}
                >
                  {tab}
                  <span className="px-1.5 py-0.5 rounded-full text-label-sm font-bold" style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table — desktop */}
          <div className="gv-card p-0! overflow-hidden hidden md:block">
            {isLoading ? (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                    {["Title", "Category", "Status", "Date", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
                      <td className="px-4 py-3"><Bone w="8rem" /></td>
                      <td className="px-4 py-3"><Bone w="5rem" /></td>
                      <td className="px-4 py-3"><Bone w="4rem" h="1.25rem" style={{ borderRadius: "9999px" }} /></td>
                      <td className="px-4 py-3"><Bone w="6rem" /></td>
                      <td className="px-4 py-3"><Bone w="4rem" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : filtered.length === 0 ? (
              <EmptyState
                title={
                  search
                    ? `No results for "${search}"`
                    : activeStatus === "All"
                    ? "No permits yet"
                    : `No ${activeStatus} permits`
                }
                description={search ? "Try a different search term." : "Permits you create will show up here."}
                fullScreen={false}
                action={
                  activeStatus === "All" && !search && isFieldOp
                    ? { label: "Create your first permit", onClick: () => router.push("/permits/create") }
                    : undefined
                }
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                    {["Title", "Category", "Status", "Date", ""].map((h) => (
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
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--gv-glass-border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gv-glass-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 text-sm font-semibold max-w-xs truncate" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={permit.status} /></td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{formatPermitDate(permit.updated_at)}</td>
                      <td className="px-4 py-3">
                        {permit.status === "Draft" && (
                          <span className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 w-fit" style={{ background: "rgba(51,144,124,0.15)", color: "#33907c" }}>
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
                title={activeStatus === "All" ? "No permits yet" : `No ${activeStatus} permits`}
                description="Permits you create will show up here."
                fullScreen={false}
                action={
                  activeStatus === "All" && isFieldOp
                    ? { label: "Create Permit", onClick: () => router.push("/permits/create") }
                    : undefined
                }
              />
            ) : filtered.map((permit) => {
              // NOTE: matches the original mobile-card badge padding (py-0.5),
              // which differs slightly from the shared StatusBadge (py-1) —
              // preserved as-is rather than silently changed.
              const st = STATUS_STYLES[permit.status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
              return (
                <div key={permit.id} onClick={() => openPermit(permit)} className="gv-card cursor-pointer active:scale-[0.99] transition-transform" style={{ padding: "14px 16px" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--gv-text-primary)" }}>{permit.title}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{permit.status}</span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "var(--gv-text-muted)" }}>{permit.categoryName ?? "—"}</p>
                  <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
                    <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{formatPermitDate(permit.updated_at)}</span>
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
        <PermitDetailModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}