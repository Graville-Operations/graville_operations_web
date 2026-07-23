"use client";

import { useState } from "react";
import { X, Tag } from "lucide-react";
import { PermitCategory } from "@/types/permits";
import { createCategory, updateCategory, resolveErrorMessage } from "@/lib/api/permits";

interface CategoryFormModalProps {
  editTarget: PermitCategory | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryFormModal({ editTarget, onClose, onSaved }: CategoryFormModalProps) {
  const [formName, setFormName] = useState(editTarget?.name ?? "");
  const [formDesc, setFormDesc] = useState(editTarget?.description ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setFormError(null);
    if (!formName.trim()) return setFormError("Name is required.");
    try {
      setSaving(true);
      const payload = { name: formName.trim(), description: formDesc.trim() || null };
      if (editTarget) {
        await updateCategory(editTarget.id, payload);
      } else {
        await createCategory(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setFormError(resolveErrorMessage(err, "Failed to save category."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-60 p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "#0d1528", border: "1px solid var(--gv-glass-border)" }}>
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
            <input
              autoFocus
              type="text"
              className="gv-input w-full text-sm"
              placeholder="e.g. Transport, Construction"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="gv-eyebrow mb-1 block">
              Description <span style={{ color: "var(--gv-text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              className="gv-input w-full text-sm"
              placeholder="Optional description..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="gv-btn-outline flex-1 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                editTarget ? "Save Changes" : "Create Category"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}