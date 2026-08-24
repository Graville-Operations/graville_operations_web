'use client';

import { useState } from 'react';
import { Truck, User, Phone, IdCard, X } from 'lucide-react';
import { Label } from '@/components/ui/typography';
import { DarkSelect } from '@/components/shared/DarkSelect';
import { CreateModeOfTransportPayload } from '@/types/transport';
import { ApiUser } from '@/types/users';
import { maskNationalId, apiUserFullName } from '@/lib/utils/transport';

interface TransportFormState {
  category_id: string;
  number_plate: string;
  driver_user_id: string;
}

const emptyForm: TransportFormState = {
  category_id: '',
  number_plate: '',
  driver_user_id: '',
};

export function TransportFormModal({
  categories,
  drivers,
  onClose,
  onCreate,
}: {
  categories: { id: number; name: string }[];
  drivers: ApiUser[];
  onClose: () => void;
  onCreate: (payload: CreateModeOfTransportPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<TransportFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof TransportFormState>(key: K, value: TransportFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const selectedDriver = drivers.find((u) => String(u.id) === form.driver_user_id);

  const handleSave = async () => {
    setError(null);
    if (!form.category_id) return setError('Vehicle category is required.');
    if (!form.number_plate.trim()) return setError('Number plate is required.');

    setSaving(true);
    try {
      await onCreate({
        category_id: Number(form.category_id),
        number_plate: form.number_plate.trim(),
        driver_id: form.driver_user_id ? Number(form.driver_user_id) : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-60 p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--gv-glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><Truck size={16} className="text-[#33907c]" /></div>
            <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>New Vehicle</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-xl px-3 py-2 text-xs font-medium" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              {error}
            </div>
          )}

          <div>
            <label className="gv-eyebrow mb-1 block">Vehicle Category *</label>
            <DarkSelect value={form.category_id} onChange={e => update('category_id', e.target.value)}>
              <option value="">Select category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </DarkSelect>
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">Number Plate *</label>
            <input
              autoFocus
              type="text"
              className="gv-input w-full text-sm"
              placeholder="e.g. KDA 123B"
              value={form.number_plate}
              onChange={e => update('number_plate', e.target.value)}
            />
          </div>

          <div className="h-px" style={{ background: 'var(--gv-glass-border)' }} />
          <Label size="sm" as="p" className="gv-eyebrow">Driver</Label>

          <div>
            <label className="gv-eyebrow mb-1 block">Assigned Driver</label>
            <DarkSelect value={form.driver_user_id} onChange={e => update('driver_user_id', e.target.value)}>
              <option value="">No driver assigned</option>
              {drivers.map(u => (
                <option key={u.id} value={u.id}>{apiUserFullName(u)}</option>
              ))}
            </DarkSelect>
            {drivers.length === 0 && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                No drivers found. Add a user with the &quot;Drivers&quot; role first.
              </p>
            )}
          </div>

          {selectedDriver && (
            <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gv-glass-border)' }}>
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
                <User size={12} className="text-white/30 shrink-0" /> {apiUserFullName(selectedDriver)}
              </p>
              <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                <Phone size={11} className="text-white/25 shrink-0" /> {selectedDriver.phone || '—'}
              </p>
              <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                <IdCard size={11} className="text-white/25 shrink-0" />
                {selectedDriver.nationalId ? maskNationalId(selectedDriver.nationalId) : '—'}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex gap-3 shrink-0">
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
              'Create Vehicle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}