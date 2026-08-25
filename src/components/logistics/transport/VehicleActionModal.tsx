'use client';

import { AlertTriangle, Tag, User, UserX, X } from 'lucide-react';
import { DarkSelect } from '@/components/shared/DarkSelect';
import { ApiUser } from '@/types/users';

export type VehicleActionMode = 'plate' | 'driver' | 'unassign';

function apiUserFullName(u: ApiUser): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
}

interface VehicleActionModalProps {
  mode: VehicleActionMode;
  isSaving: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  /** plate mode */
  plateValue?: string;
  onPlateChange?: (value: string) => void;
  /** driver mode */
  drivers?: ApiUser[];
  driverValue?: string;
  onDriverChange?: (value: string) => void;
  /** unassign mode */
  currentDriverName?: string;
}

export function VehicleActionModal({
  mode,
  isSaving,
  error,
  onCancel,
  onConfirm,
  plateValue = '',
  onPlateChange,
  drivers = [],
  driverValue = '',
  onDriverChange,
  currentDriverName,
}: VehicleActionModalProps) {
  const isDestructive = mode === 'unassign';

  const title =
    mode === 'plate' ? 'Update Number Plate' : mode === 'driver' ? 'Update Driver' : 'Unassign Driver';

  const subtitle =
    mode === 'plate'
      ? 'Confirm the new number plate for this vehicle.'
      : mode === 'driver'
      ? 'Confirm the driver you want to assign to this vehicle.'
      : currentDriverName
      ? `"${currentDriverName}" will no longer be assigned to this vehicle.`
      : 'This driver will no longer be assigned to this vehicle.';

  const confirmLabel = mode === 'plate' ? 'Update Plate' : mode === 'driver' ? 'Assign Driver' : 'Unassign';

  const confirmDisabled =
    isSaving || (mode === 'plate' && !plateValue.trim()) || (mode === 'driver' && !driverValue);

  const ConfirmIcon = mode === 'unassign' ? UserX : mode === 'driver' ? User : Tag;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-70 p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl"
        style={{
          background: '#0d1528',
          border: `1px solid ${isDestructive ? 'rgba(248,113,113,0.3)' : 'var(--gv-glass-border)'}`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: isDestructive ? 'rgba(248,113,113,0.15)' : 'rgba(51,144,124,0.15)' }}
            >
              {mode === 'plate' && <Tag size={19} style={{ color: '#33907c' }} />}
              {mode === 'driver' && <User size={19} style={{ color: '#33907c' }} />}
              {mode === 'unassign' && <AlertTriangle size={19} style={{ color: '#f87171' }} />}
            </div>
            <div>
              <p className="font-bold text-base text-white">{title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="shrink-0 p-1.5 rounded-lg disabled:opacity-50"
            style={{ color: 'var(--gv-text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {(mode === 'plate' || mode === 'driver') && (
          <div className="px-6 pb-6 space-y-2">
            <p className="text-[11px] font-semibold tracking-wider" style={{ color: 'var(--gv-text-muted)' }}>
              {mode === 'plate' ? 'NUMBER PLATE' : 'DRIVER'}
              {mode === 'plate' && <span style={{ color: '#f87171' }}> *</span>}
            </p>

            {mode === 'plate' && (
              <input
                autoFocus
                type="text"
                className="gv-input text-sm w-full"
                value={plateValue}
                onChange={(e) => onPlateChange?.(e.target.value)}
                placeholder="e.g. KDA 123A"
              />
            )}

            {mode === 'driver' && (
              <>
                <DarkSelect value={driverValue} onChange={(e) => onDriverChange?.(e.target.value)}>
                  <option value="">Select driver…</option>
                  {drivers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {apiUserFullName(u)}
                    </option>
                  ))}
                </DarkSelect>
                {drivers.length === 0 && (
                  <p className="text-xs pt-1" style={{ color: 'var(--gv-text-muted)' }}>
                    No drivers found. Add a user with the &quot;Drivers&quot; role first.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <div className="px-6 pb-2">
            <p className="text-xs font-medium" style={{ color: '#f87171' }}>
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-5"
          style={{ borderTop: '1px solid var(--gv-glass-border)' }}
        >
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase disabled:opacity-50"
            style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase disabled:opacity-50"
            style={
              isDestructive
                ? { background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
                : { background: '#33907c', color: '#fff', border: '1px solid #33907c' }
            }
          >
            {isSaving ? (
              <div
                className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: isDestructive ? '#f87171' : '#fff', borderTopColor: 'transparent' }}
              />
            ) : (
              <ConfirmIcon size={14} />
            )}
            {isSaving ? (mode === 'unassign' ? 'Unassigning...' : 'Saving...') : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}