'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Truck, User, UserX, Tag, Pencil, ChevronDown } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
import { useVehicleCategories } from '@/hooks/logistics/use-vehicle-categories';
import { ModeOfTransport, VehicleCategory } from '@/types/transport';
import { ROUTES } from '@/lib/routes';
import { driverBriefName } from '@/lib/utils/transport';
import { TransportFormModal } from '@/components/logistics/transport/TransportFormModal';
import { CategoryFormModal } from '@/components/logistics/transport/CategoryFormModal';
import { VehicleActionMode, VehicleActionModal } from '@/components/logistics/transport/VehicleActionModal';
import { StatusPill } from '@/components/logistics/transport/StatusPill';

const SECTION_LIMIT = 5;

function StatusToggle({ active, disabled, onToggle }: { active: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={active ? 'Deactivate vehicle' : 'Activate vehicle'}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 disabled:opacity-50"
      style={{ background: active ? '#33907c' : 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
        style={{ transform: active ? 'translateX(17px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

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
    loadError: vehiclesError,
    createTransport,
    savingId,
    togglingId,
    actionError,
    setActionError,
    updateNumberPlate,
    updateDriver,
    unassignDriver,
    toggleActive,
  } = useModesOfTransport();

  const {
    categories: allCategories,
    isLoading: categoriesLoading,
    loadError: categoriesError,
    toast,
    createCategory,
    updateCategory,
  } = useVehicleCategories();

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<VehicleCategory | null>(null);

  const noCategories = !vehiclesLoading && categories.length === 0;

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

  // Row actions (update plate, update driver, unassign driver) for vehicles
  const [activeModal, setActiveModal] = useState<{ id: number; mode: VehicleActionMode } | null>(null);
  const [plateDraft, setPlateDraft] = useState('');
  const [driverDraft, setDriverDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const activeTransport = activeModal ? visibleVehicles.find((t) => t.id === activeModal.id) : undefined;
  const isSavingActive = activeModal ? savingId === activeModal.id : false;

  const closeActionModal = () => {
    setActiveModal(null);
    setLocalError(null);
    setActionError(null);
  };

  const openPlateModal = (t: ModeOfTransport) => {
    setPlateDraft(t.number_plate);
    setLocalError(null);
    setActiveModal({ id: t.id, mode: 'plate' });
  };

  const openDriverModal = (t: ModeOfTransport) => {
    setDriverDraft('');
    setLocalError(null);
    setActiveModal({ id: t.id, mode: 'driver' });
  };

  const openUnassignModal = (t: ModeOfTransport) => {
    setLocalError(null);
    setActiveModal({ id: t.id, mode: 'unassign' });
  };

  const confirmPlate = async () => {
    if (!activeModal) return;
    if (!plateDraft.trim()) { setLocalError('Number plate is required.'); return; }
    try {
      await updateNumberPlate(activeModal.id, plateDraft.trim());
      closeActionModal();
    } catch {  }
  };

  const confirmDriver = async () => {
    if (!activeModal) return;
    if (!driverDraft) { setLocalError('Select a driver first.'); return; }
    try {
      await updateDriver(activeModal.id, Number(driverDraft));
      closeActionModal();
    } catch {  }
  };

  const confirmUnassign = async () => {
    if (!activeModal) return;
    try {
      await unassignDriver(activeModal.id);
      closeActionModal();
    } catch {  }
  };

  const handleToggle = (t: ModeOfTransport) => {
    toggleActive(t.id, !t.is_active).catch(() => {  });
  };

  const rowActionsDisabled = (t: ModeOfTransport) => savingId === t.id || togglingId === t.id || !t.is_active;

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

      {activeModal && activeTransport && (
        <VehicleActionModal
          mode={activeModal.mode}
          isSaving={isSavingActive}
          error={actionError ?? localError}
          plateValue={plateDraft}
          onPlateChange={setPlateDraft}
          drivers={drivers}
          driverValue={driverDraft}
          onDriverChange={setDriverDraft}
          currentDriverName={activeTransport.driver ? driverBriefName(activeTransport.driver) : undefined}
          onCancel={closeActionModal}
          onConfirm={
            activeModal.mode === 'plate' ? confirmPlate :
            activeModal.mode === 'driver' ? confirmDriver :
            confirmUnassign
          }
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
                  {['Vehicle', 'Number Plate', 'Category', 'Driver', 'Status', 'Update Plate', 'Update Driver', 'Unassign Driver'].map(h => (
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
                    <td className="px-4 py-3"><Bone w="5rem" /></td>
                    <td className="px-4 py-3"><Bone w="5rem" /></td>
                    <td className="px-4 py-3"><Bone w="5rem" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : visibleVehicles.length === 0 ? (
            !vehiclesError && (
              <EmptyState
                fullScreen={false}
                title="No vehicles yet"
                description="Add your first vehicle to get started."
                action={!noCategories ? { label: 'New Vehicle', onClick: () => setShowVehicleModal(true) } : undefined}
              />
            )
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Vehicle', 'Number Plate', 'Category', 'Driver', 'Status', 'Update Plate', 'Update Driver', 'Unassign Driver'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleVehicles.map((t, idx) => {
                  const actionsDisabled = rowActionsDisabled(t);
                  return (
                    <tr
                      key={t.id}
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusToggle
                            active={t.is_active}
                            disabled={togglingId === t.id}
                            onToggle={() => handleToggle(t)}
                          />
                          <StatusPill active={t.is_active} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          title="Update Number Plate"
                          onClick={() => openPlateModal(t)}
                          disabled={actionsDisabled}
                          className="flex items-center justify-center p-2 rounded-lg transition-colors disabled:opacity-40"
                          style={{ color: 'var(--gv-text-muted)' }}
                          onMouseEnter={e => !actionsDisabled && (e.currentTarget.style.color = '#33907c')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                        >
                          <Pencil size={19} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          title="Update Driver"
                          onClick={() => openDriverModal(t)}
                          disabled={actionsDisabled}
                          className="flex items-center justify-center p-2 rounded-lg transition-colors disabled:opacity-40"
                          style={{ color: 'var(--gv-text-muted)' }}
                          onMouseEnter={e => !actionsDisabled && (e.currentTarget.style.color = '#33907c')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                        >
                          <User size={19} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {t.driver ? (
                          <button
                            type="button"
                            title="Unassign Driver"
                            onClick={() => openUnassignModal(t)}
                            disabled={actionsDisabled}
                            className="flex items-center justify-center p-2 rounded-lg transition-colors disabled:opacity-40"
                            style={{ color: 'var(--gv-text-muted)' }}
                            onMouseEnter={e => !actionsDisabled && (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                          >
                            <UserX size={19} />
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Vehicle Categories section — centered, 3/4 width */}
      <div className="space-y-4 w-3/4 mx-auto">
        <div className="flex items-center justify-between">
          <Label size="sm" as="p" className="gv-eyebrow">
            Vehicle Categories {!categoriesLoading && `(${allCategories.length})`}
          </Label>
          <button
            type="button"
            onClick={() => { setEditCategory(null); setShowCategoryModal(true); }}
            className="gv-btn-brand flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          >
            <Plus size={13} /> New Category
          </button>
        </div>

        <div className="gv-card overflow-x-auto p-0">
          {categoriesLoading ? (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Name', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                    <td className="px-3 py-2"><Bone w="7rem" /></td>
                    <td className="px-3 py-2"><Bone w="2.5rem" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : visibleCategories.length === 0 ? (
            !categoriesError && (
              <EmptyState
                title="No vehicle categories yet"
                description="Categories you create will show up here."
                fullScreen={false}
                action={{ label: 'Create first category', onClick: () => { setEditCategory(null); setShowCategoryModal(true); } }}
              />
            )
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Name', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((cat, idx) => (
                  <tr key={cat.id} style={{ borderBottom: idx < visibleCategories.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="gv-icon-box" style={{ width: '1.75rem', height: '1.75rem' }}>
                          <Tag size={13} className="text-[#33907c]" />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => openEditCategory(cat)}
                        title="Edit Category"
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
            className="gv-btn-outline w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs"
          >
            View All Categories ({allCategories.length}) <ChevronDown size={13} />
          </button>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}