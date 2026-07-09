"use client";

import { AlertTriangle } from "lucide-react";

interface RejectConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  comment: string;
  setComment: (v: string) => void;
}

export function RejectConfirmModal({ onConfirm, onCancel, loading, comment, setComment }: RejectConfirmModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-60 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl space-y-4 p-6" style={{ background: "#0d1528", border: "1px solid rgba(248,113,113,0.3)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(248,113,113,0.15)" }}>
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
          <button onClick={onCancel} disabled={loading} className="gv-btn-outline flex-1 py-2.5 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !comment.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
          >
            {loading ? (
              <><div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Rejecting...</>
            ) : (
              "Confirm Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}