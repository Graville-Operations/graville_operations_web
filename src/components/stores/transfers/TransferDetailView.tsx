'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, CheckCircle2, XCircle, Package, Wrench,
  Truck, User, MapPin, AlertTriangle,
} from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import { Section } from '@/components/shared/Section';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import EmptyState from '@/components/ui/emptystate';
import { ROUTES } from '@/lib/routes';
import { useTransferDetail } from '@/hooks/stores/useTransferDetail';
import { TransferApprovalStatus, TRANSFER_STATUS_META } from '@/types/transfer';
import { TransferDetailField } from './TransferDetailField';

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

export function TransferDetailView({ transferId }: { transferId: number }) {
  const router = useRouter();
  const {
    transfer,
    isLoading,
    loadError,
    canApprove,
    driver,
    requestedByName,
    isActioning,
    actionError,
    setActionError,
    act,
  } = useTransferDetail(transferId);

  const [decision, setDecision] = useState<TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED>(TransferApprovalStatus.APPROVED);
  const [comment, setComment] = useState('');

  const isReject = decision === TransferApprovalStatus.REJECTED;

  const handleBack = () => router.push(ROUTES.stores.transfers.list);

  const handleSubmit = async () => {
    if (isReject && !comment.trim()) {
      setActionError('A comment is required when rejecting a transfer.');
      return;
    }
    try {
      await act(decision, comment.trim());
      setComment('');
    } catch {
      /* actionError already set by the hook */
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
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

  if (!transfer) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
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

  const meta = TRANSFER_STATUS_META[transfer.status];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
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
          <Title size="lg" as="h1">TRF-{transfer.id}</Title>
          <p className="text-xs mt-1" style={{ color: 'var(--gv-text-muted)' }}>
            Step {transfer.currentStep}
          </p>
        </div>
        <StatusPill label={meta.label} bg={meta.bg} color={meta.color} />
      </div>

      <Section title="Route">
        <div className="grid grid-cols-2 gap-4">
          <TransferDetailField
            label="Pickup Point"
            value={
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-white/40" />
                {transfer.pickUpPoint?.name ?? '—'}
              </span>
            }
          />
          <TransferDetailField
            label="Destination"
            value={
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-white/40" />
                {transfer.dropOffPoint?.name ?? '—'}
              </span>
            }
          />
        </div>
      </Section>

      {transfer.items.length > 0 && (
        <Section title="Materials">
          <div className="space-y-2">
            {transfer.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
                  <Package size={13} className="text-white/40" /> {item.materialName}
                </span>
                <span style={{ color: 'var(--gv-text-muted)' }}>Qty {item.quantity}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {transfer.toolItems.length > 0 && (
        <Section title="Tools">
          <div className="space-y-2">
            {transfer.toolItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
                  <Wrench size={13} className="text-white/40" /> {item.toolName}
                </span>
                <span style={{ color: 'var(--gv-text-muted)' }}>Qty {item.quantity}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Vehicle & Driver">
        <div className="grid grid-cols-2 gap-4">
          <TransferDetailField
            label="Vehicle"
            value={
              transfer.transport ? (
                <span className="flex items-center gap-1.5">
                  <Truck size={13} className="text-white/40" />
                  {transfer.transport.name} · {transfer.transport.numberPlate}
                </span>
              ) : (
                '—'
              )
            }
          />
          <TransferDetailField
            label="Driver"
            value={
              driver ? (
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-white/40" />
                  {driver.name}{driver.phone ? ` · ${driver.phone}` : ''}
                </span>
              ) : (
                '—'
              )
            }
          />
        </div>
      </Section>

           <Section title="Details">
        <div className="grid grid-cols-2 gap-4">
          <TransferDetailField label="Created" value={transfer.createdAt || '—'} />
          {transfer.notes && (
            <div className="col-span-2">
              <TransferDetailField label="Notes" value={transfer.notes} />
            </div>
          )}
        </div>
      </Section>

      {/* Only rendered when this user is the approver for the step the
          transfer is currently on, and that step is still pending —
          matching the server-side rule (see resolveCanApprove). */}
      {canApprove && (
        <Section title="Action Required">
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
            onClick={handleSubmit}
            disabled={isActioning}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={
              isReject
                ? { background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
                : { background: '#33907C', color: 'white', border: '1px solid transparent' }
            }
          >
            {isActioning && (
              <div
                className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                style={{ borderColor: isReject ? '#f87171' : 'white', borderTopColor: 'transparent' }}
              />
            )}
            {isActioning ? 'Working…' : isReject ? 'Reject Transfer' : 'Approve Transfer'}
          </button>
        </Section>
      )}
    </div>
  );
}