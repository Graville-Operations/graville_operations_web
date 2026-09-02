'use client';

import { Plus } from 'lucide-react';
import { useInternalDeliveries } from '@/hooks/logistics/useInternalDeliveries';
import SearchInput from '@/components/finance/shared/SearchInput';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import DeliveryStatusFilterDropdown from '@/components/logistics/material-delivery/DeliveryStatusFilterDropdown';
import DeliveryStatCards from '@/components/logistics/material-delivery/DeliveryStatCards';
import MaterialDeliveryTable from '@/components/logistics/material-delivery/MaterialDeliveryTable';
import InitiateDeliveryOverlay from '@/components/logistics/material-delivery/InitiateDeliveryOverlay';

export default function InternalWorksPage() {
  const {
    deliveries, totalDeliveries, inTransitCount, loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    dateFrom, dateTo, appliedLabel, applyDateFilter, clearDateFilter,
    hasFilter,
    showInitiateModal, openInitiateModal, closeInitiateModal, initiateDelivery,
    siteNameById, transportLabelById,
    sites, transportOptions, transferOptions,
    materialsBySite, toolsBySite, loadMaterialsForSite, loadToolsForSite,
  } = useInternalDeliveries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Logistics · Materials Delivery</p>
          <h1 className="text-2xl font-bold mt-1">Internal Works</h1>
        </div>
        <button
          onClick={openInitiateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus size={15} />
          Create Driver Task
        </button>
      </div>

      <DeliveryStatCards total={totalDeliveries} inTransit={inTransitCount} />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, material…" />
        <DeliveryStatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />
        <DateFilterDropdown
          from={dateFrom}
          to={dateTo}
          appliedLabel={appliedLabel}
          onApply={applyDateFilter}
          onClear={clearDateFilter}
        />
      </div>

      <MaterialDeliveryTable
        deliveries={deliveries}
        loading={loading}
        hasFilter={hasFilter}
        siteNameById={siteNameById}
        transportLabelById={transportLabelById}
      />

      <InitiateDeliveryOverlay
        open={showInitiateModal}
        onClose={closeInitiateModal}
        onSubmit={initiateDelivery}
        sites={sites}
        transportOptions={transportOptions}
        transferOptions={transferOptions}
        materialsBySite={materialsBySite}
        toolsBySite={toolsBySite}
        loadMaterialsForSite={loadMaterialsForSite}
        loadToolsForSite={loadToolsForSite}
      />
    </div>
  );
}