'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Fuel, Search, ChevronDown, AlertTriangle } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useFuelManagement } from '@/hooks/logistics/useFuelManagement';
import { FuelType } from '@/types/fuel';
import { ROUTES } from '@/lib/routes';

function FuelTypeTag({ type }: { type: FuelType }) {
  const isDiesel = type === 'diesel';
  return (
    <span
      className="gv-tag"
      style={{
        color: isDiesel ? '#f59e0b' : '#33907c',
        background: isDiesel ? 'rgba(245,158,11,0.12)' : 'rgba(51,144,124,0.15)',
        border: `1px solid ${isDiesel ? 'rgba(245,158,11,0.3)' : 'rgba(51,144,124,0.35)'}`,
      }}
    >
      {isDiesel ? 'Diesel' : 'Petrol'}
    </span>
  );
}

const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
];

function FuelTypeFilterDropdown({
  value,
  onChange,
}: {
  value: FuelType | '';
  onChange: (value: FuelType | '') => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = FUEL_TYPE_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative shrink-0" ref={ref} style={{ width: '160px' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl text-sm"
        style={{
          background: value ? 'rgba(51,144,124,0.08)' : 'var(--gv-glass-bg)',
          border: `1px solid ${value ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: value ? 'var(--gv-text-primary)' : 'var(--gv-text-muted)',
        }}
      >
        <span className="truncate text-xs">{selected?.label ?? 'All Fuel Types'}</span>
        <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--gv-text-subtle)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-full rounded-2xl z-30 overflow-hidden"
          style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs transition-colors"
            style={{
              background: !value ? 'rgba(51,144,124,0.15)' : 'transparent',
              color: !value ? '#33907c' : 'var(--gv-text-muted)',
              borderBottom: '1px solid var(--gv-glass-border)',
            }}
          >
            All Fuel Types
          </button>
          {FUEL_TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors"
              style={{
                background: o.value === value ? 'rgba(51,144,124,0.15)' : 'transparent',
                color: o.value === value ? '#33907c' : 'var(--gv-text-muted)',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtKes(n: number): string {
  return n.toLocaleString('en-KE', { minimumFractionDigits: 0 });
}

export default function FuelManagementPage() {
  const router = useRouter();
  const {
    filteredVehicles,
    isLoading,
    loadError,
    search,
    setSearch,
    fuelTypeFilter,
    setFuelTypeFilter,
  } = useFuelManagement();

  return (
    <div className="space-y-8">
      <ShimmerStyle />

      {/* Header */}
      <div>
        <Label size="sm" as="p" className="gv-eyebrow mb-1">Logistics · Transport</Label>
        <Title size="lg" as="h1">Fuel Management</Title>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
          <AlertTriangle size={15} className="shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gv-text-subtle)' }} />
          <input
            type="text"
            placeholder="Search by vehicle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input pl-9! py-2! text-sm w-full"
          />
        </div>
        <FuelTypeFilterDropdown value={fuelTypeFilter} onChange={setFuelTypeFilter} />
      </div>

      {/* Table */}
      <div className="gv-card overflow-x-auto p-0">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Fuel Type', 'Total Amount'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3"><Bone w="7rem" /></td>
                  <td className="px-4 py-3"><Bone w="5rem" /></td>
                  <td className="px-4 py-3"><Bone w="6rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filteredVehicles.length === 0 ? (
          <EmptyState
            fullScreen={false}
            title="No fuel records found"
            description={search || fuelTypeFilter ? 'Try a different search or filter.' : 'Fuel records will show up here once logged.'}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Vehicle', 'Fuel Type', 'Total Amount'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v, idx) => (
                <tr
                  key={v.id}
                  onClick={() => router.push(ROUTES.logistics.fuelManagement.detail(v.id))}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: idx < filteredVehicles.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                        <Fuel size={14} className="text-[#33907c]" />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{v.vehicle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><FuelTypeTag type={v.fuelType} /></td>
                  <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                    KES {fmtKes(v.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}