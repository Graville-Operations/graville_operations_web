'use client';

import { Loader2 } from 'lucide-react';

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmTone?: 'primary' | 'destructive';
  submitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmActionModal({
  open, title, description, confirmLabel, confirmTone = 'primary', submitting, onConfirm, onCancel,
}: ConfirmActionModalProps) {
  if (!open) return null;

  const confirmCls = confirmTone === 'destructive'
    ? 'bg-[color:var(--destructive)] text-white hover:opacity-90'
    : 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl gv-glass-bg border border-[color:var(--border)] shadow-2xl p-6 flex flex-col gap-4"
      >
        <div>
          <h3 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h3>
          <p className="text-sm text-[color:var(--muted-foreground)] mt-1.5">{description}</p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${confirmCls}`}
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? 'Submitting…' : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="w-full py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}