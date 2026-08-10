'use client';

import { X } from 'lucide-react';
import { useSupplierInvoices } from '@/hooks/supplier-invoices/useSupplierInvoices';
import SearchInput from '@/components/finance/shared/SearchInput';
import SiteFilterDropdown from '@/components/finance/shared/SiteFilterDropdown';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import StatusFilterDropdown from '@/components/finance/shared/StatusFilterDropdown';
import SupplierInvoicesTable from '@/components/finance/suppliers/SupplierInvoicesTable';
import SupplierInvoiceCards from '@/components/finance/suppliers/SupplierInvoiceCards';

export default function SupplierInvoicesPage() {
  const {
    sites,
    isLoading,
    search,
    setSearch,
    siteId,
    setSiteId,
    startDate,
    endDate,
    applyDateFilter,
    clearDateFilter,
    statusFilter,
    setStatusFilter,
    filtered,
    hasFilter,
    openDetail,
    clearAllFilters,
  } = useSupplierInvoices();

  return (
    <div className="space-y-6"> 
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>Supplier Invoices</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
          {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}{hasFilter ? ' (filtered)' : ''}
        </p>
      </div>
      <div className="gv-card p-3!">
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by invoice no, supplier, requester…"
          />

          <SiteFilterDropdown sites={sites} value={siteId} onChange={setSiteId} />

          <DateFilterDropdown
            from={startDate}
            to={endDate}
            onApply={applyDateFilter}
            onClear={clearDateFilter}
          />

          <StatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />

          {hasFilter && (siteId || startDate || endDate || statusFilter) && (
            <button
              onClick={clearAllFilters}
              className="p-2 rounded-lg shrink-0"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <SupplierInvoicesTable
        invoices={filtered}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onSelect={openDetail}
      />

      <SupplierInvoiceCards
        invoices={filtered}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onSelect={openDetail}
      />
    </div>
  );
}