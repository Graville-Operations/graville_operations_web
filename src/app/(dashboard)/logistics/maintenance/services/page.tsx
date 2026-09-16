'use client';

import { useVehicleServices } from '@/hooks/logistics/useVehicleServices';
import SearchInput from '@/components/finance/shared/SearchInput';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import ServiceTypeFilterDropdown from '@/components/logistics/maintenance/ServiceTypeFilterDropdown';
import ServiceStatusFilterDropdown from '@/components/logistics/maintenance/ServiceStatusFilterDropdown';
import VehicleServiceTable from '@/components/logistics/maintenance/VehicleServiceTable';

export default function MaintenanceServicesPage() {
  const {
    services, loading,
    search, setSearch,
    serviceTypeFilter, setServiceTypeFilter,
    statusFilter, setStatusFilter,
    dateFrom, dateTo, appliedLabel, applyDateFilter, clearDateFilter,
    hasFilter,
  } = useVehicleServices();

  return (
    <div className="space-y-6">
      <div>
        <p className="gv-eyebrow">Logistics · Maintenance</p>
        <h1 className="text-2xl font-bold mt-1">Services</h1>
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