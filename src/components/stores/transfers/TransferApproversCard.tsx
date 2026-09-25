'use client';

import { AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { TransferApproval, TransferApprovalStatus } from '@/types/transfer';
import { ApiUser } from '@/types/users';

const APPROVAL_STATUS_STYLES: Record<TransferApprovalStatus, { bg: string; color: string }> = {
  [TransferApprovalStatus.PENDING]: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  [TransferApprovalStatus.APPROVED]: { bg: 'rgba(51,144,124,0.15)', color: '#33907c' },
  [TransferApprovalStatus.REJECTED]: { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

function resolveApproverName(approverId: number, users: ApiUser[]): string {
  const match = users.find((u) => u.id === approverId);
  return match ? `${match.firstName} ${match.lastName}`.trim() : 'Unknown User';
}

interface TransferApproversCardProps {
  approvals: TransferApproval[];
  users: ApiUser[];
  canApprove: boolean;
  /** No longer used for gating — kept optional so existing callers don't break. */
  currentUserId?: number | null;
  comment: string;
  setComment: (v: string) => void;
  isActioning: boolean;
  actionError: string | null;
  onApprove: () => void;
  onRejectClick: () => void;
}

export function TransferApproversCard({
  approvals,
  users,
  canApprove,
  comment,
  setComment,
  isActioning,
  actionError,
  onApprove,
  onRejectClick,
}: TransferApproversCardProps) {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="gv-card space-y-4">
        <p className="gv-eyebrow">Approvers</p>
        <EmptyState
          fullScreen={false}
          title="No approvers assigned"
          description="This transfer doesn't have an approval chain configured yet."
        />
      </div>
    );
  }

  const hasComment = approvals.some((a) => a.comment);
  const sorted = [...approvals].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className="gv-card space-y-4">
      <p className="gv-eyebrow">Approvers</p>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gv-glass-border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
              {['Approver', 'Status', ...(hasComment ? ['Comment'] : [])].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-semibold uppercase tracking-wider"
                  style={{ color: '#33907c', fontSize: '10px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((approval) => {
              const st = APPROVAL_STATUS_STYLES[approval.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
              return (
                <tr key={approval.id} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-3 py-2" style={{ color: 'var(--gv-text-muted)' }}>
                    {resolveApproverName(approval.approverId, users)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {approval.status}
                    </span>
                  </td>
                  {hasComment && (
                    <td className="px-3 py-2" style={{ color: 'var(--gv-text-muted)' }}>{approval.comment ?? '—'}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canApprove && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gv-glass-border)' }}>
          <p className="gv-eyebrow" style={{ letterSpacing: '0.15em' }}>Take Action</p>

          <div>
            <label className="gv-eyebrow mb-1 block text-label-sm">
              Comment <span style={{ color: 'var(--gv-text-muted)', fontWeight: 400 }}>(required to reject)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note for this decision…"
              rows={2}
              disabled={isActioning}
              className="gv-input resize-none text-sm w-full"
            />
          </div>

          {actionError && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
            >
              <AlertTriangle size={14} className="shrink-0" /> {actionError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onApprove}
              disabled={isActioning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand disabled:opacity-50 flex items-center justify-center"
            >
              {isActioning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Approve'
              )}
            </button>
            <button
              type="button"
              onClick={onRejectClick}
              disabled={isActioning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}