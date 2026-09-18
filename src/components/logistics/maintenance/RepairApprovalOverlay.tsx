'use client';

import { useEffect, useState } from 'react';
import { X, Wrench } from 'lucide-react';
import ConfirmActionModal from './ConfirmActionModal';
import {
  VehicleRepair,
  RepairApprovalForm,
  emptyRepairApprovalForm,
} from '@/types/vehicle-repair';

interface RepairApprovalOverlayProps {
  repair: VehicleRepair | null;
  onClose: () => void;
  onApprove: (form: RepairApprovalForm) => Promise<void>;
  onReject: (comment: string) => Promise<void>;
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-[color:var(--muted)] border border-[color:var(--border)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">{label}</label>
      <div className="px-3 py-2 rounded-lg text-sm bg-[color:var(--muted)]/50 border border-[color:var(--border)] text-[color:var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

export default function RepairApprovalOverlay({ repair, onClose, onApprove, onReject }: RepairApprovalOverlayProps) {
  const [form, setForm] = useState<RepairApprovalForm>(emptyRepairApprovalForm());
  const [confirmReject, setConfirmReject] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (repair) {
      setForm(emptyRepairApprovalForm());
      setActionError(null);
    }
  }, [repair]);

  useEffect(() => {
    if (!repair) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && !confirmReject && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [repair, confirmReject, onClose]);

  if (!repair) return null;

  // Backend requires approved_cost > 0 when approving.
  const approvedCostValid = Number(form.approvedCost) > 0;

  const handleApproveClick = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await onApprove(form);
    } catch (err) {
      console.error('[RepairApprovalOverlay] approve failed:', err);
      setActionError(err instanceof Error ? err.message : 'Could not approve this repair');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await onReject(form.comment);
      setConfirmReject(false);
    } catch (err) {
      console.error('[RepairApprovalOverlay] reject failed:', err);
      setConfirmReject(false);
      setActionError(err instanceof Error ? err.message : 'Could not reject this repair');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl gv-glass-bg border border-[color:var(--border)] shadow-2xl"
        >
          <div className="flex items-start justify-between p-6 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><Wrench size={18} className="text-[color:var(--primary)]" /></div>
              <div>
                <h2 className="text-base font-semibold text-[color:var(--foreground)]">Review Repair Request</h2>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">{repair.vehicle} — {repair.number_plate}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {actionError && (
              <div className="px-3 py-2 rounded-lg text-sm border border-[color:var(--destructive)] text-[color:var(--destructive)] bg-[color:var(--destructive)]/10">
                {actionError}
              </div>
            )}

            <ReadOnlyField label="Vehicle" value={`${repair.vehicle} — ${repair.number_plate}`} />
            <ReadOnlyField label="Issue" value={repair.issue} />
            <ReadOnlyField label="Requested Cost" value={`KES ${repair.requested_cost.toLocaleString()}`} />

            <Field label="Cost to Approve">
              <input
                className={inputCls}
                type="number"
                min="1"
                placeholder="e.g. 40000"
                value={form.approvedCost}
                onChange={(e) => setForm((p) => ({ ...p, approvedCost: e.target.value }))}
              />
            </Field>

            <ReadOnlyField label="Date" value={repair.date} />

            <Field label="Comments">
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Optional comments…"
                value={form.comment}
                onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 p-6 border-t border-[color:var(--border)]">
            <button
              type="button"
              onClick={() => setConfirmReject(true)}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[color:var(--destructive)] text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/10 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleApproveClick}
              disabled={submitting || !approvedCostValid}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Approving…' : 'Approve'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={confirmReject}
        title="Reject this repair request?"
        description={`This will reject the repair request for ${repair.vehicle} — ${repair.number_plate}. This action cannot be undone.`}
        confirmLabel="Reject Request"
        confirmTone="destructive"
        submitting={submitting}
        onConfirm={handleRejectConfirm}
        onCancel={() => setConfirmReject(false)}
      />
    </>
  );
}