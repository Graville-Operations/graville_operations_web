'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Truck, User, Phone, IdCard, Search, X, Tag } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
import { ModeOfTransport } from '@/types/transport';
import { ROUTES } from '@/lib/routes';
import { maskNationalId, driverBriefName } from '@/lib/utils/transport';
import { cacheTransportPreview } from '@/lib/utils/transport-preview';
import { TransportFormModal } from '@/components/logistics/transport/TransportFormModal';
import { StatusPill } from '@/components/logistics/transport/StatusPill';

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
  } = useModesOfTransport();

  const [showModal, setShowModal] = useState(false);
  const openCreate = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const goToDetail = (t: ModeOfTransport) => {
    cacheTransportPreview(t);
    router.push(ROUTES.logistics.transport.modeOfTransportDetail(t.id));
  };

  const noCategories = !isLoading && !loadError && categories.length === 0;

  return (
    <div className="space-y-6">
      <ShimmerStyle />

      {showModal && (
        <TransportFormModal
          categories={categories}
          drivers={drivers}
          onClose={closeModal}
          onCreate={createTransport}
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
                {['Vehicle', 'Number Plate', 'Category', 'Driver Name', 'Driver Phone', 'National ID', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3"><Bone w="9rem" /></td>
                  <td className="px-4 py-3"><Bone w="5rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                  <td className="px-4 py-3"><Bone w="7rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                  <td className="px-4 py-3"><Bone w="5rem" /></td>
                  <td className="px-4 py-3"><Bone w="4rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            fullScreen={false}
            title={search ? 'No vehicles match your search' : 'No vehicles yet'}
            description={search ? 'Try a different search term.' : 'Add your first vehicle to get started.'}
            action={!search && !noCategories ? { label: 'New Vehicle', onClick: openCreate } : undefined}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Number Plate', 'Category', 'Driver Name', 'Driver Phone', 'National ID', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr
                  key={t.id}
                  onClick={() => goToDetail(t)}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
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
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                    {t.driver?.phone_no ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-white/30 shrink-0" /> {t.driver.phone_no}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--gv-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                    {t.driver?.national_id ? (
                      <span className="flex items-center gap-1.5">
                        <IdCard size={12} className="text-white/30 shrink-0" /> {maskNationalId(t.driver.national_id)}
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
    </div>
  );
}