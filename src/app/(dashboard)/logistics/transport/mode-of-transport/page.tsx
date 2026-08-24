'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Truck, User, Tag, Pencil, ChevronDown } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
import { useVehicleCategories } from '@/hooks/logistics/use-vehicle-categories';
import { ModeOfTransport, VehicleCategory } from '@/types/transport';
import { ROUTES } from '@/lib/routes';
import { driverBriefName } from '@/lib/utils/transport';
import { cacheTransportPreview } from '@/lib/utils/transport-preview';
import { TransportFormModal } from '@/components/logistics/transport/TransportFormModal';
import { CategoryFormModal } from '@/components/logistics/transport/CategoryFormModal';
import { StatusPill } from '@/components/logistics/transport/StatusPill';

const SECTION_LIMIT = 5;

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

export default function ModeOfTransportPage() {
  const router = useRouter();

  const {
    transports,
    categories,
    drivers,
    isLoading: vehiclesLoading,
    createTransport,
  } = useModesOfTransport();

  const {
    categories: allCategories,
    isLoading: categoriesLoading,
    toast,
    createCategory,
    updateCategory,
  } = useVehicleCategories();

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<VehicleCategory | null>(null);

  const noCategories = !vehiclesLoading && categories.length === 0;

  const goToDetail = (t: ModeOfTransport) => {
    cacheTransportPreview(t);
    router.push(ROUTES.logistics.transport.modeOfTransportDetail(t.id));
  };

  const openEditCategory = (cat: VehicleCategory) => {
    setEditCategory(cat);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditCategory(null);
  };

  const visibleVehicles = transports.slice(0, SECTION_LIMIT);
  const visibleCategories = allCategories.slice(0, SECTION_LIMIT);

  return (
    <div className="space-y-8">
      <ShimmerStyle />

      {showVehicleModal && (
        <TransportFormModal
          categories={categories}
          drivers={drivers}
          onClose={() => setShowVehicleModal(false)}
          onCreate={createTransport}
        />
      )}

      {showCategoryModal && (
        <CategoryFormModal
          editTarget={editCategory}
          onClose={closeCategoryModal}
          onCreate={createCategory}
          onUpdate={updateCategory}
        />
      )}

      {/* Header */}
      <div>
        <Label size="sm" as="p" className="gv-eyebrow mb-1">Logistics</Label>
        <Title size="lg" as="h1">Transport</Title>
      </div>

      {/* Vehicles section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label size="sm" as="p" className="gv-eyebrow">
            Vehicles {!vehiclesLoading && `(${transports.length})`}
          </Label>
          <button
            type="button"
            onClick={() => setShowVehicleModal(true)}
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
            <span>You need at least one vehicle category before adding a vehicle.</span>
          </div>
        )}

        <div className="gv-card overflow-x-auto p-0">
          {vehiclesLoading ? (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Vehicle', 'Number Plate', 'Category', 'Driver', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                    <td className="px-4 py-3"><Bone w="9rem" /></td>
                    <td className="px-4 py-3"><Bone w="5rem" /></td>
                    <td className="px-4 py-3"><Bone w="6rem" /></td>
                    <td className="px-4 py-3"><Bone w="7rem" /></td>
                    <td className="px-4 py-3"><Bone w="4rem" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : visibleVehicles.length === 0 ? (
            <EmptyState
              fullScreen={false}
              title="No vehicles yet"
              description="Add your first vehicle to get started."
              action={!noCategories ? { label: 'New Vehicle', onClick: () => setShowVehicleModal(true) } : undefined}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Vehicle', 'Number Plate', 'Category', 'Driver', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleVehicles.map((t, idx) => (
                  <tr
                    key={t.id}
                    onClick={() => goToDetail(t)}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    style={{ borderBottom: idx < visibleVehicles.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                          <Truck size={14} className="text-[#33907c]" />
                        </div>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--gv-text-primary)' }}>{t.number_plate}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                      {t.number_plate}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-muted)' }}>
                      {t.category_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                      {t.driver ? (
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-white/30 shrink-0" /> {driverBriefName(t.driver)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gv-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusPill active={t.is_active} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!vehiclesLoading && transports.length > SECTION_LIMIT && (
          <button
            type="button"
            onClick={() => router.push(ROUTES.logistics.transport.modeOfTransportAll)}
            className="gv-btn-outline w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
          >
            View All Vehicles ({transports.length}) <ChevronDown size={14} />
          </button>
        )}
      </div>

      {/* Vehicle Categories section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label size="sm" as="p" className="gv-eyebrow">
            Vehicle Categories {!categoriesLoading && `(${allCategories.length})`}
          </Label>
          <button
            type="button"
            onClick={() => { setEditCategory(null); setShowCategoryModal(true); }}
            className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus size={15} /> New Category
          </button>
        </div>

        <div className="gv-card overflow-x-auto p-0">
          {categoriesLoading ? (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Name', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                    <td className="px-4 py-3"><Bone w="8rem" /></td>
                    <td className="px-4 py-3"><Bone w="3rem" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : visibleCategories.length === 0 ? (
            <EmptyState
              title="No vehicle categories yet"
              description="Categories you create will show up here."
              fullScreen={false}
              action={{ label: 'Create first category', onClick: () => { setEditCategory(null); setShowCategoryModal(true); } }}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Name', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((cat, idx) => (
                  <tr key={cat.id} style={{ borderBottom: idx < visibleCategories.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                          <Tag size={14} className="text-[#33907c]" />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditCategory(cat)}
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

        {!categoriesLoading && allCategories.length > SECTION_LIMIT && (
          <button
            type="button"
            onClick={() => router.push(ROUTES.logistics.transport.vehicleCategory)}
            className="gv-btn-outline w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
          >
            View All Categories ({allCategories.length}) <ChevronDown size={14} />
          </button>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}