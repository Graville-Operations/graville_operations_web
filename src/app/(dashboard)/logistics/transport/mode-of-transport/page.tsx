'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Truck, User, Phone, IdCard, Search, X, Tag, ChevronRight } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { DarkSelect } from '@/components/shared/DarkSelect';
import { useModesOfTransport } from '@/hooks/logistics/use-modes-of-transport';
import { ModeOfTransport, CreateModeOfTransportPayload } from '@/types/transport';
import { ApiUser } from '@/types/users';
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

/** Full name for a driver embedded in a ModeOfTransport response (driver.first_name/last_name). */
function driverBriefName(d: { first_name: string; last_name: string }): string {
  return `${d.first_name} ${d.last_name}`.trim();
}

/** Full name for a driver picked from the /transport/drivers/list endpoint (ApiUser shape). */
function apiUserFullName(u: ApiUser): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
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
  driver_user_id: string;
}

const emptyForm: TransportFormState = {
  category_id: '',
  number_plate: '',
  driver_user_id: '',
};

function TransportFormModal({
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

export default function ModeOfTransportPage() {
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
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--gv-text-primary)' }}>{t.name || t.number_plate}</p>
                      <ChevronRight size={14} className="text-white/20 shrink-0 ml-auto" />
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