'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { TransferApprovalStatus, TransferRow } from '@/types/transfer';

interface TransferApprovalModalProps {
  transfer: TransferRow | null;
  isSaving: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (
    status: TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED,
    comment: string,
  ) => void;
}

export default function TransferApprovalModal({
  transfer,
  isSaving,
  error,
  onCancel,
  onConfirm,
}: TransferApprovalModalProps) {
  const [decision, setDecision] = useState<TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED>(TransferApprovalStatus.APPROVED);
  const [comment, setComment] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (transfer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecision(TransferApprovalStatus.APPROVED);
      setComment('');
      setLocalError(null);
    }
  }, [transfer]);

  useEffect(() => {
    if (!transfer) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && !isSaving && onCancel();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [transfer, isSaving, onCancel]);

  if (!transfer) return null;

  const isReject = decision === TransferApprovalStatus.REJECTED;

  const handleConfirm = () => {
    if (isReject && !comment.trim()) {
      setLocalError('A comment is required when rejecting a transfer.');
      return;
    }
    setLocalError(null);
    onConfirm(decision, comment.trim());
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-sm text-white">Action Transfer TRF-{transfer.id}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
              Step {transfer.currentStep} · {transfer.pickUpPoint} → {transfer.dropOffPoint}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-1 text-white/40 hover:text-white transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Decision toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDecision(TransferApprovalStatus.APPROVED)}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={
              !isReject
                ? { background: 'rgba(51,144,124,0.2)', color: '#33907c', border: '1px solid rgba(51,144,124,0.4)' }
                : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }
            }
          >
            <CheckCircle2 size={15} /> Approve
          </button>
          <button
            type="button"
            onClick={() => setDecision(TransferApprovalStatus.REJECTED)}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={
              isReject
                ? { background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)' }
                : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }
            }
          >
            <XCircle size={15} /> Reject
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--gv-text-muted)' }}>
            Comment{isReject && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSaving}
            placeholder={isReject ? 'Why is this being rejected?' : 'Optional note…'}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:border-[#33907c] focus:ring-1 focus:ring-[#33907c] transition-colors"
            style={{
              background: 'var(--gv-glass-bg)',
              border: '1px solid var(--gv-glass-border)',
              color: 'var(--gv-text-primary)',
            }}
          />
        </div>

        {(localError || error) && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-xs">
            {localError || error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{
              background: 'var(--gv-glass-bg)',
              color: 'var(--gv-text-muted)',
              border: '1px solid var(--gv-glass-border)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={
              isReject
                ? { background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
                : { background: '#33907C', color: 'white', border: '1px solid transparent' }
            }
          >
            {isSaving && (
              <div
                className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                style={{ borderColor: isReject ? '#f87171' : 'white', borderTopColor: 'transparent' }}
              />
            )}
            {isSaving ? 'Working…' : isReject ? 'Reject Transfer' : 'Approve Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}