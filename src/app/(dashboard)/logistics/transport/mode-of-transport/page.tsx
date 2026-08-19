'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Truck, User, Phone, IdCard, Search, X, AlertTriangle, Tag } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { DarkSelect } from '@/components/shared/DarkSelect';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
import {
  ModeOfTransport,
  CreateModeOfTransportPayload,
  UpdateModeOfTransportPayload,
} from '@/types/transport';
import { formatDate } from '@/lib/utils/date';
import { ROUTES } from '@/lib/routes';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white z-60 shadow-xl pointer-events-none
        ${type === 'success' ? 'bg-[#33907c]' : 'bg-red-600'}`}
    >
      <Label size="sm" as="span" className="text-white normal-case tracking-normal">
        {message}
      </Label>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="gv-tag"
      style={{
        color: active ? '#33907C' : 'var(--gv-text-subtle)',
        background: active ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
        border: `1px solid ${active ? 'rgba(51,144,124,0.35)' : 'var(--border)'}`,
      }}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

interface TransportFormState {
  category_id: string;
  number_plate: string;
  name: string;
  driver_name: string;
  driver_phone: string;
  driver_national_id: string;
  is_active: boolean;
}

function emptyForm(t: ModeOfTransport | null): TransportFormState {
  return {
    category_id: t?.category_id ? String(t.category_id) : '',
    number_plate: t?.number_plate ?? '',
    name: t?.name ?? '',
    driver_name: t?.driver_name ?? '',
    driver_phone: t?.driver_phone ?? '',
    driver_national_id: t?.driver_national_id ?? '',
    is_active: t?.is_active ?? true,
  };
}

function TransportFormModal({
  editTarget,
  categories,
  onClose,
  onCreate,
  onUpdate,
}: {
  editTarget: ModeOfTransport | null;
  categories: { id: number; name: string }[];
  onClose: () => void;
  onCreate: (payload: CreateModeOfTransportPayload) => Promise<void>;
  onUpdate: (id: number, payload: UpdateModeOfTransportPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<TransportFormState>(emptyForm(editTarget));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof TransportFormState>(key: K, value: TransportFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setError(null);
    if (!form.category_id) return setError('Vehicle category is required.');
    if (!form.number_plate.trim()) return setError('Number plate is required.');

    setSaving(true);
    try {
      if (editTarget) {
        await onUpdate(editTarget.id, {
          category_id: Number(form.category_id),
          number_plate: form.number_plate.trim(),
          name: form.name.trim() || undefined,
          driver_name: form.driver_name.trim() || undefined,
          driver_phone: form.driver_phone.trim() || undefined,
          driver_national_id: form.driver_national_id.trim() || undefined,
          is_active: form.is_active,
        });
      } else {
        await onCreate({
          category_id: Number(form.category_id),
          number_plate: form.number_plate.trim(),
          name: form.name.trim() || undefined,
          driver_name: form.driver_name.trim() || undefined,
          driver_phone: form.driver_phone.trim() || undefined,
          driver_national_id: form.driver_national_id.trim() || undefined,
        });
      }
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
            <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>
              {editTarget ? 'Edit Vehicle' : 'New Vehicle'}
            </h3>
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

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="gv-eyebrow mb-1 block">
                Vehicle Name <span style={{ color: 'var(--gv-text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                className="gv-input w-full text-sm"
                placeholder="e.g. Site Truck 1"
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--gv-glass-border)' }} />
          <Label size="sm" as="p" className="gv-eyebrow">Driver Details</Label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="gv-eyebrow mb-1 block">Driver Name</label>
              <input
                type="text"
                className="gv-input w-full text-sm"
                placeholder="Driver's full name"
                value={form.driver_name}
                onChange={e => update('driver_name', e.target.value)}
              />
            </div>
            <div>
              <label className="gv-eyebrow mb-1 block">Driver Phone</label>
              <input
                type="text"
                className="gv-input w-full text-sm"
                placeholder="e.g. 0712 345 678"
                value={form.driver_phone}
                onChange={e => update('driver_phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="gv-eyebrow mb-1 block">Driver National ID</label>
            <input
              type="text"
              className="gv-input w-full text-sm"
              placeholder="National ID number"
              value={form.driver_national_id}
              onChange={e => update('driver_national_id', e.target.value)}
            />
          </div>

          {editTarget && (
            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => update('is_active', e.target.checked)}
                className="w-4 h-4 rounded accent-[#33907c] cursor-pointer"
              />
              <span className="text-sm" style={{ color: 'var(--gv-text-primary)' }}>Vehicle is active</span>
            </label>
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
              editTarget ? 'Save Changes' : 'Create Vehicle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteTransportModal({
  transport,
  deleting,
  onConfirm,
  onCancel,
}: {
  transport: ModeOfTransport;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-70 p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl space-y-4 p-6" style={{ background: '#0d1528', border: '1px solid rgba(248,113,113,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <AlertTriangle size={18} style={{ color: '#f87171' }} />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Delete vehicle?</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
              &quot;{transport.name || transport.number_plate}&quot; will be permanently removed.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
          >
            {deleting ? (
              <><div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Deleting...</>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModeOfTransportPage() {
  const {
    filtered,
    categories,
    isLoading,
    loadError,
    toast,
    search,
    setSearch,
    createTransport,
    updateTransport,
  } = useModesOfTransport();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ModeOfTransport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModeOfTransport | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (t: ModeOfTransport) => { setEditTarget(t); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const noCategories = !isLoading && categories.length === 0;

  return (
    <div className="space-y-6">
      <ShimmerStyle />

      {showModal && (
        <TransportFormModal
          editTarget={editTarget}
          categories={categories}
          onClose={closeModal}
          onCreate={createTransport}
          onUpdate={updateTransport}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label size="sm" as="p" className="gv-eyebrow mb-1">Logistics · Transport</Label>
          <Title size="lg" as="h1">Modes of Transport</Title>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={noCategories}
          title={noCategories ? 'Add a vehicle category first' : undefined}
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-40"
        >
          <Plus size={15} /> New Vehicle
        </button>
      </div>

      {noCategories && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}>
          <Tag size={15} className="shrink-0" />
          <span>
            You need at least one vehicle category before adding a vehicle.{' '}
            <Link href={ROUTES.logistics.transport.vehicleCategory} className="font-medium underline" style={{ color: '#33907c' }}>
              Create one now
            </Link>
          </span>
        </div>
      )}

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <Search size={15} className="text-white/40 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, plate or driver…"
          className="flex-1 bg-transparent outline-none placeholder:text-white/30 text-white text-body-sm"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-white/30 hover:text-white transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {loadError && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
          {loadError}
        </div>
      )}

      <Label size="sm" as="p" className="gv-eyebrow">
        All Vehicles {!isLoading && `(${filtered.length})`}
      </Label>

      {/* Table */}
      <div className="gv-card p-0! overflow-hidden overflow-x-auto">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Category', 'Driver', 'Status', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3"><Bone w="9rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                  <td className="px-4 py-3"><Bone w="8rem" /></td>
                  <td className="px-4 py-3"><Bone w="4rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                  <td className="px-4 py-3"><Bone w="3rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No vehicles match your search' : 'No vehicles yet'}
            description={search ? 'Try a different search term.' : 'Vehicles you add will show up here.'}
            fullScreen={false}
            action={search || noCategories ? undefined : { label: 'Add first vehicle', onClick: openCreate }}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Category', 'Driver', 'Status', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                        <Truck size={14} className="text-[#33907c]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--gv-text-primary)' }}>{t.name || t.number_plate}</p>
                        <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>{t.number_plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-muted)' }}>
                    {t.category_name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {t.driver_name ? (
                      <div className="space-y-0.5">
                        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--gv-text-primary)' }}>
                          <User size={12} className="text-white/30" /> {t.driver_name}
                        </p>
                        {t.driver_phone && (
                          <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                            <Phone size={11} className="text-white/25" /> {t.driver_phone}
                          </p>
                        )}
                        {t.driver_national_id && (
                          <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gv-text-muted)' }}>
                            <IdCard size={11} className="text-white/25" /> {t.driver_national_id}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusPill active={t.is_active} /></td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-muted)' }}>{formatDate(t.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--gv-text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#33907c')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--gv-text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}