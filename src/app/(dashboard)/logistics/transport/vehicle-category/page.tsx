'use client';

import { useState } from 'react';
import { Plus, Pencil, Tag, Search, X } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useVehicleCategories } from '@/hooks/logistics/use-vehicle-categories';
import { VehicleCategory, CreateVehicleCategoryPayload } from '@/types/transport';
import { formatDate } from '@/lib/utils/date';

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

function CategoryFormModal({
  editTarget,
  onClose,
  onCreate,
  onUpdate,
}: {
  editTarget: VehicleCategory | null;
  onClose: () => void;
  onCreate: (payload: CreateVehicleCategoryPayload) => Promise<void>;
  onUpdate: (id: number, payload: CreateVehicleCategoryPayload) => Promise<void>;
}) {
  const [name, setName] = useState(editTarget?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) return setError('Category name is required.');
    setSaving(true);
    try {
      if (editTarget) {
        await onUpdate(editTarget.id, { name: name.trim() });
      } else {
        await onCreate({ name: name.trim() });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category.');
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
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--gv-glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><Tag size={16} className="text-[#33907c]" /></div>
            <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>
              {editTarget ? 'Edit Vehicle Category' : 'New Vehicle Category'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl px-3 py-2 text-xs font-medium" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              {error}
            </div>
          )}
          <div>
            <label className="gv-eyebrow mb-1 block">Category Name *</label>
            <input
              autoFocus
              type="text"
              className="gv-input w-full text-sm"
              placeholder="e.g. Truck, Van, Pickup"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="flex gap-3 pt-1">
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
                editTarget ? 'Save Changes' : 'Create Category'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleCategoryPage() {
  const {
    filtered,
    isLoading,
    toast,
    search,
    setSearch,
    createCategory,
    updateCategory,
  } = useVehicleCategories();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<VehicleCategory | null>(null);

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (cat: VehicleCategory) => { setEditTarget(cat); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };



  return (
    <div className="space-y-6">
      <ShimmerStyle />

      {showModal && (
        <CategoryFormModal
          editTarget={editTarget}
          onClose={closeModal}
          onCreate={createCategory}
          onUpdate={updateCategory}
        />
      )}      

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label size="sm" as="p" className="gv-eyebrow mb-1">Logistics · Transport</Label>
          <Title size="lg" as="h1">Vehicle Categories</Title>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={15} /> New Category
        </button>
      </div>

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <Search size={15} className="text-white/40 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vehicle categories…"
          className="flex-1 bg-transparent outline-none placeholder:text-white/30 text-white text-body-sm"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-white/30 hover:text-white transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      <Label size="sm" as="p" className="gv-eyebrow">
        All Categories {!isLoading && `(${filtered.length})`}
      </Label>

      {/* Table */}
      <div className="gv-card p-0! overflow-hidden overflow-x-auto">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Name', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3"><Bone w="8rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                  <td className="px-4 py-3"><Bone w="3rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No categories match your search' : 'No vehicle categories yet'}
            description={search ? 'Try a different search term.' : 'Categories you create will show up here.'}
            fullScreen={false}
            action={search ? undefined : { label: 'Create first category', onClick: openCreate }}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Name', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr key={cat.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                        <Tag size={14} className="text-[#33907c]" />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{formatDate(cat.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--gv-text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#33907c')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                    >
                      <Pencil size={14} />
                    </button>
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