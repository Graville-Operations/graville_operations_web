'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Truck, User, Phone, IdCard, Tag, Pencil, UserX, Calendar } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { DarkSelect } from '@/components/shared/DarkSelect';
import { useModeOfTransportDetail } from '@/hooks/logistics/use-mode-of-transport-detail';
import { ApiUser } from '@/types/users';
import { formatDate } from '@/lib/utils/date';
import { ROUTES } from '@/lib/routes';

/** Masks a national ID so only the first and last 2 digits are visible, e.g. "40****78". */
function maskNationalId(id: string): string {
  const digits = id.trim();
  if (digits.length <= 4) return digits;
  const first = digits.slice(0, 2);
  const last = digits.slice(-2);
  const hidden = '*'.repeat(digits.length - 4);
  return `${first}${hidden}${last}`;
}

function apiUserFullName(u: ApiUser): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
}

function StatusToggle({
  active,
  disabled,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="flex items-center gap-2.5 disabled:opacity-50"
    >
      <span
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
        style={{ background: active ? '#33907c' : 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{ transform: active ? 'translateX(22px)' : 'translateX(3px)' }}
        />
      </span>
      <span className="text-sm font-medium" style={{ color: active ? '#33907C' : 'var(--gv-text-muted)' }}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </button>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Bone w="6rem" h="1rem" />
      <div className="gv-card space-y-4 p-6">
        <Bone w="12rem" h="1.5rem" />
        <Bone w="8rem" h="1rem" />
        <div className="h-px" style={{ background: 'var(--gv-glass-border)' }} />
        <Bone w="100%" h="4rem" />
        <Bone w="100%" h="4rem" />
      </div>
    </div>
  );
}

export default function ModeOfTransportDetailPage() {
  const params = useParams<{ id: string }>();
  const transportId = Number(params.id);
  const router = useRouter();

  const {
    transport,
    categoryName,
    drivers,
    isLoading,
    loadError,
    actionError,
    isSaving,
    updateNumberPlate,
    updateDriver,
    toggleActive,
    unassignDriver,
  } = useModeOfTransportDetail(transportId);

  const [editingPlate, setEditingPlate] = useState(false);
  const [plateDraft, setPlateDraft] = useState('');
  const [editingDriver, setEditingDriver] = useState(false);
  const [driverDraft, setDriverDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const startEditPlate = () => {
    setPlateDraft(transport?.number_plate ?? '');
    setLocalError(null);
    setEditingPlate(true);
  };

  const savePlate = async () => {
    if (!plateDraft.trim()) { setLocalError('Number plate is required.'); return; }
    try {
      await updateNumberPlate(plateDraft.trim());
      setEditingPlate(false);
    } catch {
      // actionError from the hook already surfaces the message
    }
  };

  const startEditDriver = () => {
    setDriverDraft('');
    setLocalError(null);
    setEditingDriver(true);
  };

  const saveDriver = async () => {
    if (!driverDraft) { setLocalError('Select a driver first.'); return; }
    try {
      await updateDriver(Number(driverDraft));
      setEditingDriver(false);
    } catch {
      // actionError from the hook already surfaces the message
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignDriver();
    } catch {
      // actionError from the hook already surfaces the message
    }
  };

  const handleToggleActive = async () => {
    if (!transport) return;
    try {
      await toggleActive(!transport.is_active);
    } catch {
      // actionError from the hook already surfaces the message
    }
  };

  return (
    <div className="space-y-6">
      <ShimmerStyle />

      <button
        onClick={() => router.push(ROUTES.logistics.transport.modeOfTransport)}
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--gv-text-muted)' }}
      >
        <ArrowLeft size={15} /> Back to Modes of Transport
      </button>

      {isLoading ? (
        <DetailSkeleton />
      ) : loadError || !transport ? (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center gap-2">
          <Truck size={28} className="text-white/20" />
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{loadError ?? 'Vehicle not found.'}</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><Truck size={18} className="text-[#33907c]" /></div>
              <div>
                <Label size="sm" as="p" className="gv-eyebrow mb-1">Logistics · Transport</Label>
                <Title size="lg" as="h1">{transport.name || transport.number_plate}</Title>
              </div>
            </div>
            <StatusToggle active={transport.is_active} disabled={isSaving} onToggle={handleToggleActive} />
          </div>

          {(actionError || localError) && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              {actionError ?? localError}
            </div>
          )}

          {/* Vehicle details */}
          <div className="gv-card p-6 space-y-5">
            <Label size="sm" as="p" className="gv-eyebrow">Vehicle Details</Label>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--gv-text-muted)' }}>Number Plate</p>
                {editingPlate ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      className="gv-input text-sm"
                      value={plateDraft}
                      onChange={e => setPlateDraft(e.target.value)}
                    />
                    <button onClick={savePlate} disabled={isSaving} className="gv-btn-brand px-3 py-2 rounded-lg text-xs disabled:opacity-50">
                      Save
                    </button>
                    <button onClick={() => setEditingPlate(false)} disabled={isSaving} className="gv-btn-outline px-3 py-2 rounded-lg text-xs">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{transport.number_plate}</p>
                )}
              </div>
              {!editingPlate && (
                <button
                  onClick={startEditPlate}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg"
                  style={{ color: '#33907c', border: '1px solid var(--gv-glass-border)' }}
                >
                  <Pencil size={12} /> Update Number Plate
                </button>
              )}
            </div>

            <div className="h-px" style={{ background: 'var(--gv-glass-border)' }} />

            <div className="flex items-center gap-2 text-sm">
              <Tag size={13} className="text-white/30" />
              <span style={{ color: 'var(--gv-text-muted)' }}>Category:</span>
              <span style={{ color: 'var(--gv-text-primary)' }}>{categoryName ?? '—'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar size={13} className="text-white/30" />
              <span style={{ color: 'var(--gv-text-muted)' }}>Created:</span>
              <span style={{ color: 'var(--gv-text-primary)' }}>{formatDate(transport.created_at)}</span>
            </div>
          </div>

          {/* Driver */}
          <div className="gv-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label size="sm" as="p" className="gv-eyebrow">Driver</Label>
              <div className="flex items-center gap-2">
                {transport.driver && !editingDriver && (
                  <button
                    onClick={handleUnassign}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-50"
                    style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
                  >
                    <UserX size={12} /> Unassign Driver
                  </button>
                )}
                {!editingDriver && (
                  <button
                    onClick={startEditDriver}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg"
                    style={{ color: '#33907c', border: '1px solid var(--gv-glass-border)' }}
                  >
                    <Pencil size={12} /> Update Driver
                  </button>
                )}
              </div>
            </div>

            {editingDriver ? (
              <div className="space-y-3">
                <DarkSelect value={driverDraft} onChange={e => setDriverDraft(e.target.value)}>
                  <option value="">Select driver…</option>
                  {drivers.map(u => (
                    <option key={u.id} value={u.id}>{apiUserFullName(u)}</option>
                  ))}
                </DarkSelect>
                {drivers.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>
                    No drivers found. Add a user with the &quot;Drivers&quot; role first.
                  </p>
                )}
                <div className="flex gap-2">
                  <button onClick={saveDriver} disabled={isSaving} className="gv-btn-brand px-3 py-2 rounded-lg text-xs disabled:opacity-50">
                    Save
                  </button>
                  <button onClick={() => setEditingDriver(false)} disabled={isSaving} className="gv-btn-outline px-3 py-2 rounded-lg text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            ) : transport.driver ? (
              <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gv-glass-border)' }}>
                <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
                  <User size={12} className="text-white/30 shrink-0" /> {transport.driver.first_name} {transport.driver.last_name}
                </p>
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                  <Phone size={11} className="text-white/25 shrink-0" /> {transport.driver.phone_no || '—'}
                </p>
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                  <IdCard size={11} className="text-white/25 shrink-0" />
                  {transport.driver.national_id ? maskNationalId(transport.driver.national_id) : '—'}
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>No driver assigned.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}