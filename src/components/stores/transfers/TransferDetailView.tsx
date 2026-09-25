'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, CheckCircle2, XCircle, Package, Wrench,
  Truck, User, MapPin, AlertTriangle,
} from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import { Section } from '@/components/shared/Section';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { DarkSelect } from '@/components/shared/DarkSelect';
import EmptyState from '@/components/ui/emptystate';
import { ROUTES } from '@/lib/routes';
import { useTransferDetail } from '@/hooks/stores/useTransferDetail';
import { useTransferAssignment } from '@/hooks/stores/useTransferAssignment';
import { useUsers } from '@/hooks/users/useUsers';
import {
  TransferApproval, TransferApprovalStatus, TransferStatus, TRANSFER_STATUS_META,
} from '@/types/transfer';
import type { ApiUser } from '@/types/users';
import { TransferDetailField } from './TransferDetailField';

const APPROVAL_STATUS_META: Record<TransferApprovalStatus, { label: string; bg: string; color: string }> = {
  [TransferApprovalStatus.PENDING]:  { label: 'Pending',  bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [TransferApprovalStatus.APPROVED]: { label: 'Approved', bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
  [TransferApprovalStatus.REJECTED]: { label: 'Rejected', bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

function resolveApproverName(users: ApiUser[], approverId: number): string {
  const match = users.find((u) => u.id === approverId);
  return match ? `${match.firstName} ${match.lastName}`.trim() : `Approver #${approverId}`;
}

function StatusPill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

function InfoGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="gv-eyebrow">{title}</p>
      {children}
    </div>
  );
}

// Uses the same two-column grid as the Details / Vehicle & Driver blocks, so
// Quantity lines up in the same column as Destination and Driver.
function LineItemTable({
  heading,
  icon: Icon,
  items,
}: {
  heading: string;
  icon: typeof Package;
  items: { name: string; quantity: number }[];
}) {
  return (
    <div className="space-y-2">
      <div
        className="grid grid-cols-2 gap-4 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--gv-text-subtle)' }}
      >
        <span>{heading}</span>
        <span>Quantity</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-2 gap-4 items-center text-sm">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
            <Icon size={13} className="text-white/40" /> {item.name || '—'}
          </span>
          <span style={{ color: 'var(--gv-text-primary)' }}>{item.quantity}</span>
        </div>
      ))}
    </div>
  );
}

function NotAssigned() {
  return <span style={{ color: 'var(--gv-text-muted)' }}>Not assigned yet</span>;
}

// Each approver in the chain gets its own card. The card for the step the
// current user can act on additionally renders the approve/reject controls;
// every other card is a read-only status summary.
function ApproverCard({
  approval,
  approverName,
  isCurrent,
  decision,
  setDecision,
  comment,
  setComment,
  isActioning,
  actionError,
  onApprove,
  onRejectClick,
}: {
  approval: TransferApproval;
  approverName: string;
  isCurrent: boolean;
  decision: TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED;
  setDecision: (d: TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED) => void;
  comment: string;
  setComment: (v: string) => void;
  isActioning: boolean;
  actionError: string | null;
  onApprove: () => void;
  onRejectClick: () => void;
}) {
  const meta = APPROVAL_STATUS_META[approval.status];
  const isReject = decision === TransferApprovalStatus.REJECTED;

  return (
    <div className="gv-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label size="sm" as="p" className="gv-eyebrow mb-1">Step {approval.stepOrder}</Label>
          <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
            <User size={13} className="text-white/40" /> {approverName}
          </p>
        </div>
        <StatusPill label={meta.label} bg={meta.bg} color={meta.color} />
      </div>

      {approval.comment && (
        <p className="text-xs italic" style={{ color: 'var(--gv-text-muted)' }}>
          &ldquo;{approval.comment}&rdquo;
        </p>
      )}

      {isCurrent && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDecision(TransferApprovalStatus.APPROVED)}
              disabled={isActioning}
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
              disabled={isActioning}
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
              disabled={isActioning}
              placeholder={isReject ? 'Why is this being rejected?' : 'Optional note…'}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:border-[#33907c] focus:ring-1 focus:ring-[#33907c] transition-colors"
              style={{
                background: 'var(--gv-glass-bg)',
                border: '1px solid var(--gv-glass-border)',
                color: 'var(--gv-text-primary)',
              }}
            />
          </div>

          {actionError && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-xs">
              <AlertTriangle size={13} className="shrink-0" /> {actionError}
            </div>
          )}

          <button
            onClick={isReject ? onRejectClick : onApprove}
            disabled={isActioning}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={
              isReject
                ? { background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
                : { background: '#33907C', color: 'white', border: '1px solid transparent' }
            }
          >
            {isActioning && !isReject && (
              <div
                className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                style={{ borderColor: 'white', borderTopColor: 'transparent' }}
              />
            )}
            {isActioning && !isReject ? 'Working…' : isReject ? 'Reject Transfer' : 'Approve Transfer'}
          </button>
        </div>
      )}
    </div>
  );
}

export function TransferDetailView({ transferId }: { transferId: number }) {
  const router = useRouter();
  const {
    transfer,
    preview,
    vehicleLabel,
    isLoading,
    loadError,
    canApprove,
    driver,
    isActioning,
    actionError,
    setActionError,
    act,
    isOwnDraft,
    transportOptions,
    isLoadingTransports,
    isAssigningTransport,
    isSubmittingDraft,
    editError,
    setEditError,
    assignTransport,
    submitDraft,
  } = useTransferDetail(transferId);

  const assignment = useTransferAssignment(transferId, transfer);
  const { users } = useUsers();

  const [decision, setDecision] = useState<TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED>(TransferApprovalStatus.APPROVED);
  const [comment, setComment] = useState('');
  const [selectedTransportId, setSelectedTransportId] = useState<number | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    if (transfer) setSelectedTransportId(transfer.transport?.id ?? null);
  }, [transfer]);

  const handleBack = () => router.push(ROUTES.stores.transfers.list);

  // Approve goes straight through — no confirmation step.
  const handleApproveNow = async () => {
    try {
      await act(TransferApprovalStatus.APPROVED, comment.trim());
      setComment('');
    } catch {
      /* actionError already set by the hook */
    }
  };

  // Reject always asks for confirmation before it's actually sent.
  const handleRejectClick = () => {
    if (!comment.trim()) {
      setActionError('A comment is required when rejecting a transfer.');
      return;
    }
    setActionError(null);
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    try {
      await act(TransferApprovalStatus.REJECTED, comment.trim());
      setComment('');
      setShowRejectConfirm(false);
    } catch {
      /* actionError already set by the hook; keep the modal open so it's visible */
    }
  };

  const handleCancelRejectConfirm = () => {
    if (isActioning) return;
    setShowRejectConfirm(false);
  };

  const handleSaveVehicle = async () => {
    if (selectedTransportId == null) return;
    try {
      await assignTransport(selectedTransportId);
    } catch {
    }
  };

  const handleSubmitDraft = async () => {
    try {
      await submitDraft();
    } catch {
      /* editError already set by the hook */
    }
  };
  if (isLoading && !transfer && !preview) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <ShimmerStyle />
        <Bone w="8rem" h="1.5rem" />
        <div className="gv-card space-y-4">
          <Bone w="100%" h="1rem" />
          <Bone w="100%" h="1rem" />
          <Bone w="60%" h="1rem" />
        </div>
      </div>
    );
  }

  if (!transfer && !preview) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm"
          style={{ color: 'var(--gv-text-muted)' }}
        >
          <ChevronLeft size={16} /> Back to transfers
        </button>
        <EmptyState
          fullScreen={false}
          title="Couldn't load this transfer"
          description={loadError ?? 'This transfer may not exist.'}
        />
      </div>
    );
  }
  const status = transfer?.status ?? preview?.status ?? TransferStatus.DRAFT;
  const meta = TRANSFER_STATUS_META[status];
  const pickupName = transfer?.pickUpPoint?.name ?? preview?.pickUpPoint ?? '—';
  const destinationName = transfer?.dropOffPoint?.name ?? preview?.dropOffPoint ?? '—';
  const createdAt = transfer?.createdAt ?? preview?.createdAt ?? '—';

  const materials = transfer
    ? transfer.items.map((i) => ({ name: i.materialName, quantity: i.quantity }))
    : (preview?.lineItems.filter((l) => l.kind === 'MATERIAL') ?? []);

  const tools = transfer
    ? transfer.toolItems.map((i) => ({ name: i.toolName, quantity: i.quantity }))
    : (preview?.lineItems.filter((l) => l.kind === 'TOOL') ?? []);
  const hasTransportDetail = !!transfer;
  const shownVehicle = assignment.vehicleLabel || vehicleLabel;
  const shownDriver = assignment.driver ?? driver;
  const stillResolving = assignment.isResolving && !shownVehicle && !shownDriver;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-sm"
        style={{ color: 'var(--gv-text-muted)' }}
      >
        <ChevronLeft size={16} /> Back to transfers
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Label size="sm" as="p" className="gv-eyebrow mb-1">Store</Label>
          <Title size="lg" as="h1">TRF-{transferId}</Title>
        </div>
        <StatusPill label={meta.label} bg={meta.bg} color={meta.color} />
      </div>

      {/* Details, Materials, Tools and Vehicle & Driver all live in one
          card, with just spacing (no hairlines) between groups. */}
      <div className="gv-card space-y-6">
        <InfoGroup title="Details">
          <div className="grid grid-cols-2 gap-4">
            <TransferDetailField
              label="Pickup Point"
              value={
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-white/40" />
                  {pickupName}
                </span>
              }
            />
            <TransferDetailField
              label="Destination"
              value={
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-white/40" />
                  {destinationName}
                </span>
              }
            />
            <TransferDetailField label="Created" value={createdAt} />
            {transfer?.notes && (
              <TransferDetailField label="Notes" value={transfer.notes} />
            )}
          </div>
        </InfoGroup>

        {materials.length > 0 && (
          <InfoGroup title="Materials">
            <LineItemTable heading="Material" icon={Package} items={materials} />
          </InfoGroup>
        )}

        {tools.length > 0 && (
          <InfoGroup title="Tools">
            <LineItemTable heading="Tool" icon={Wrench} items={tools} />
          </InfoGroup>
        )}

        <InfoGroup title="Vehicle & Driver">
          <div className="grid grid-cols-2 gap-4">
            <TransferDetailField
              label="Vehicle"
              value={
                !hasTransportDetail || stillResolving ? (
                  <Bone w="7rem" h="0.85rem" />
                ) : shownVehicle ? (
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-white/40" />
                    {shownVehicle}
                  </span>
                ) : (
                  <NotAssigned />
                )
              }
            />
            <TransferDetailField
              label="Driver"
              value={
                !hasTransportDetail || stillResolving ? (
                  <Bone w="7rem" h="0.85rem" />
                ) : shownDriver ? (
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-white/40" />
                    {shownDriver.name}{shownDriver.phone ? ` · ${shownDriver.phone}` : ''}
                  </span>
                ) : (
                  <NotAssigned />
                )
              }
            />
          </div>
        </InfoGroup>
      </div>

      {

      }
      {isOwnDraft && (
        <Section title="Edit Draft">
          <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>
            Materials, route and quantities are locked in once a transfer is created — update the vehicle here, then submit for approval.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--gv-text-muted)' }}>
              Vehicle
            </label>
            <DarkSelect
              value={selectedTransportId ?? ''}
              onChange={(e) => setSelectedTransportId(e.target.value ? Number(e.target.value) : null)}
              disabled={isLoadingTransports || isAssigningTransport}
            >
              <option value="">{isLoadingTransports ? 'Loading vehicles…' : 'No vehicle assigned'}</option>
              {transportOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name} · {t.number_plate}</option>
              ))}
            </DarkSelect>
          </div>

          {editError && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-xs">
              <AlertTriangle size={13} className="shrink-0" /> {editError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveVehicle}
              disabled={isAssigningTransport || selectedTransportId == null}
              className="py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-primary)', border: '1px solid var(--gv-glass-border)' }}
            >
              {isAssigningTransport ? 'Saving…' : 'Save Vehicle'}
            </button>
            <button
              type="button"
              onClick={handleSubmitDraft}
              disabled={isSubmittingDraft}
              className="py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ background: '#33907C', color: 'white', border: '1px solid transparent' }}
            >
              {isSubmittingDraft ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </div>
        </Section>
      )}

      {

      }
      {transfer && transfer.approvals.length > 0 && (
        <div className="space-y-3">
          <p className="gv-eyebrow px-1">Approvers</p>
          {[...transfer.approvals]
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((approval) => {
              const isCurrent = canApprove && approval.stepOrder === transfer.currentStep;
              return (
                <ApproverCard
                  key={approval.id}
                  approval={approval}
                  approverName={resolveApproverName(users, approval.approverId)}
                  isCurrent={isCurrent}
                  decision={decision}
                  setDecision={setDecision}
                  comment={comment}
                  setComment={setComment}
                  isActioning={isActioning}
                  actionError={isCurrent ? actionError : null}
                  onApprove={handleApproveNow}
                  onRejectClick={handleRejectClick}
                />
              );
            })}
        </div>
      )}

      {showRejectConfirm && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-red-400 shrink-0" />
              <p className="font-bold text-sm text-white">Reject TRF-{transferId}?</p>
            </div>
            <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>
              This transfer will be rejected with the comment: &ldquo;{comment.trim()}&rdquo;. This can&apos;t be undone.
            </p>

            {actionError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-xs">
                <AlertTriangle size={13} className="shrink-0" /> {actionError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelRejectConfirm}
                disabled={isActioning}
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
                onClick={handleConfirmReject}
                disabled={isActioning}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                {isActioning && (
                  <div
                    className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                    style={{ borderColor: '#f87171', borderTopColor: 'transparent' }}
                  />
                )}
                {isActioning ? 'Rejecting…' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}