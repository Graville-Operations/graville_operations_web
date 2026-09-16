'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Plus, Search, Tag, Truck, User, UserX, X } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
import { ModeOfTransport } from '@/types/transport';
import { ROUTES } from '@/lib/routes';
import { maskNationalId, driverBriefName } from '@/lib/utils/transport';
import { TransportFormModal } from '@/components/logistics/transport/TransportFormModal';
import { VehicleActionMode, VehicleActionModal } from '@/components/logistics/transport/VehicleActionModal';
import { StatusPill } from '@/components/logistics/transport/StatusPill';

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

export default function AllVehiclesPage() {
  const router = useRouter();
  const {
    filtered,
    categories,
    drivers,
    isLoading,
    loadError,
    search,
    setSearch,
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

  const [showModal, setShowModal] = useState(false);
  const openCreate = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const [activeModal, setActiveModal] = useState<{ id: number; mode: VehicleActionMode } | null>(null);
  const [plateDraft, setPlateDraft] = useState('');
  const [driverDraft, setDriverDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const activeTransport = activeModal ? filtered.find((t) => t.id === activeModal.id) : undefined;
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

  const noCategories = !isLoading && !loadError && categories.length === 0;
  const rowActionsDisabled = (t: ModeOfTransport) => savingId === t.id || togglingId === t.id || !t.is_active;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <ShimmerStyle />

      {showModal && (
        <TransportFormModal
          categories={categories}
          drivers={drivers}
          onClose={closeModal}
          onCreate={createTransport}
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
          <Title size="lg" as="h1">Vehicles</Title>
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
          type="text"
          placeholder="Search vehicles, plates, drivers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full placeholder:text-white/30"
          style={{ color: 'var(--gv-text-primary)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: 'var(--gv-text-muted)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="gv-card overflow-x-auto p-0">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Category', 'Driver', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3"><Bone w="9rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                  <td className="px-4 py-3"><Bone w="7rem" /></td>
                  <td className="px-4 py-3"><Bone w="4rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          // Only a genuinely empty list gets the empty state — a failed
          // fetch is handled silently, not this.
          !loadError && (
            <EmptyState
              fullScreen={false}
              title={search ? 'No vehicles match your search' : 'No vehicles yet'}
              description={search ? 'Try a different search term.' : 'Add your first vehicle to get started.'}
              action={!search && !noCategories ? { label: 'New Vehicle', onClick: openCreate } : undefined}
            />
          )
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Category', 'Driver', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => {
                const actionsDisabled = rowActionsDisabled(t);
                return (
                  <tr key={t.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                          <Truck size={14} className="text-[#33907c]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--gv-text-primary)' }}>{t.number_plate}</p>
                          {t.driver?.national_id && (
                            <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--gv-text-muted)' }}>
                              ID {maskNationalId(t.driver.national_id)}
                            </p>
                          )}
                        </div>
                      </div>
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
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Update Number Plate"
                          onClick={() => openPlateModal(t)}
                          disabled={actionsDisabled}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                          style={{ color: 'var(--gv-text-muted)' }}
                          onMouseEnter={e => !actionsDisabled && (e.currentTarget.style.color = '#33907c')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title="Update Driver"
                          onClick={() => openDriverModal(t)}
                          disabled={actionsDisabled}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                          style={{ color: 'var(--gv-text-muted)' }}
                          onMouseEnter={e => !actionsDisabled && (e.currentTarget.style.color = '#33907c')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                        >
                          <User size={14} />
                        </button>
                        {t.driver && (
                          <button
                            type="button"
                            title="Unassign Driver"
                            onClick={() => openUnassignModal(t)}
                            disabled={actionsDisabled}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                            style={{ color: 'var(--gv-text-muted)' }}
                            onMouseEnter={e => !actionsDisabled && (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}