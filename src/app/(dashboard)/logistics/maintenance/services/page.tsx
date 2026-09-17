'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useVehicleServices } from '@/hooks/logistics/useVehicleServices';
import SearchInput from '@/components/finance/shared/SearchInput';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import ServiceTypeFilterDropdown from '@/components/logistics/maintenance/ServiceTypeFilterDropdown';
import ServiceStatusFilterDropdown from '@/components/logistics/maintenance/ServiceStatusFilterDropdown';
import VehicleServiceTable from '@/components/logistics/maintenance/VehicleServiceTable';

const ALLOWED_APPROVER_ROLES = ['DIRECTOR'];

function useCanApproveServices(): boolean {
  const role = useAuthStore((s) => s.role);
  return ALLOWED_APPROVER_ROLES.includes((role ?? '').toUpperCase());
}

export default function MaintenanceServicesPage() {
  const {
    services, loading,
    search, setSearch,
    serviceTypeFilter, setServiceTypeFilter,
    statusFilter, setStatusFilter,
    dateFrom, dateTo, appliedLabel, applyDateFilter, clearDateFilter,
    hasFilter,
  } = useVehicleServices();

  const canApprove = useCanApproveServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="gv-eyebrow">Logistics · Maintenance</p>
          <h1 className="text-2xl font-bold mt-1">Services</h1>
        </div>
        {canApprove && (
          <Link
            href="/logistics/maintenance/services/approvals"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShieldCheck size={15} />
            Approvals
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by vehicle…" />
        <ServiceTypeFilterDropdown value={serviceTypeFilter} onChange={setServiceTypeFilter} />
        <ServiceStatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />
        <DateFilterDropdown
          from={dateFrom}
          to={dateTo}
          appliedLabel={appliedLabel}
          onApply={applyDateFilter}
          onClear={clearDateFilter}
        />
      </div>

      <VehicleServiceTable services={services} loading={loading} hasFilter={hasFilter} />
    </div>
  );
}