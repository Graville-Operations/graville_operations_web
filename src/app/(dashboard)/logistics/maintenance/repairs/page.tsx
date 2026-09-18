'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useVehicleRepairs } from '@/hooks/logistics/useVehicleRepairs';
import SearchInput from '@/components/finance/shared/SearchInput';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import RepairStatusFilterDropdown from '@/components/logistics/maintenance/RepairStatusFilterDropdown';
import VehicleRepairTable from '@/components/logistics/maintenance/VehicleRepairTable';

const ALLOWED_APPROVER_ROLES = ['DIRECTOR'];

function useCanApproveRepairs(): boolean {
  const role = useAuthStore((s) => s.role);
  return ALLOWED_APPROVER_ROLES.includes((role ?? '').toUpperCase());
}

export default function MaintenanceRepairsPage() {
  const {
    repairs, loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    dateFrom, dateTo, appliedLabel, applyDateFilter, clearDateFilter,
    hasFilter,
  } = useVehicleRepairs();

  const canApprove = useCanApproveRepairs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="gv-eyebrow">Logistics · Maintenance</p>
          <h1 className="text-2xl font-bold mt-1">Repairs</h1>
        </div>
        {canApprove && (
          <Link
            href="/logistics/maintenance/repairs/approvals"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShieldCheck size={15} />
            Approvals
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by number plate…" />
        <RepairStatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />
        <DateFilterDropdown
          from={dateFrom}
          to={dateTo}
          appliedLabel={appliedLabel}
          onApply={applyDateFilter}
          onClear={clearDateFilter}
        />
      </div>

      <VehicleRepairTable repairs={repairs} loading={loading} hasFilter={hasFilter} />
    </div>
  );
}