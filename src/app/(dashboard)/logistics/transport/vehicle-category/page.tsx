'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Tag, Search, X } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useVehicleCategories } from '@/hooks/logistics/use-vehicle-categories';
import { VehicleCategory } from '@/types/transport';
import { formatDate } from '@/lib/utils/date';
import { ROUTES } from '@/lib/routes';
import { CategoryFormModal } from '@/components/logistics/transport/CategoryFormModal';

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

export default function VehicleCategoryPage() {
  const router = useRouter();
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

      <button
        onClick={() => router.push(ROUTES.logistics.transport.modeOfTransport)}
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--gv-text-muted)' }}
      >
        <ArrowLeft size={15} /> Back to Transport
      </button>

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