"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import EmptyState from "@/components/ui/emptystate";
import { Bone, ShimmerStyle } from "@/components/shared/Shimmer";
import { CategoryFormModal } from "./CategoryFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useCategories } from "@/hooks/permits/useCategories";

export function CategoriesTab() {
  const {
    categories, loading, refetch,
    showModal, editTarget, openCreate, openEdit, closeModal,
    deleteTarget, setDeleteTarget, deleting, deleteError, setDeleteError,
    handleDeleteConfirm,
  } = useCategories();

  return (
    <div className="space-y-4">
      <ShimmerStyle />
      {showModal && (
        <CategoryFormModal editTarget={editTarget} onClose={closeModal} onSaved={refetch} />
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
        <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--gv-glass-border)" }}>
                  <td className="px-4 py-3"><Bone w="7rem" /></td>
                  <td className="px-4 py-3"><Bone w="10rem" /></td>
                  <td className="px-4 py-3"><Bone w="3rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Categories you create will show up here."
            fullScreen={false}
            action={{ label: "Create first category", onClick: openCreate }}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(51,144,124,0.08)", borderBottom: "1px solid var(--gv-glass-border)" }}>
                {["Name", "Description", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#33907c" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id} style={{ borderBottom: idx < categories.length - 1 ? "1px solid var(--gv-glass-border)" : "none" }}>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--gv-text-primary)" }}>{cat.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>{cat.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--gv-text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#33907c")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gv-text-muted)")}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--gv-text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gv-text-muted)")}
                      >
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