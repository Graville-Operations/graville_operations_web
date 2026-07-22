'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useSubcontractorInvoices } from '@/hooks/subcontractor-invoices/useSubcontractorInvoices';
import { SearchInput } from '@/components/finance/subcontractor-invoices/SearchInput';
import { SiteFilterDropdown } from '@/components/finance/subcontractor-invoices/SiteFilterDropdown';
import { DateFilterDropdown } from '@/components/finance/subcontractor-invoices/DateFilterDropdown';
import { SubcontractorInvoicesTable } from '@/components/finance/subcontractor-invoices/SubcontractorInvoicesTable';
import { NewInvoiceModal } from '@/components/finance/subcontractor-invoices/NewInvoiceModal';
import { InvoiceDetailView } from '@/components/finance/subcontractor-invoices/InvoiceDetailView';

export default function SubcontractorInvoicesPage() {
  const {
    filtered,
    isLoading,
    total,
    sites,
    search,
    setSearch,
    siteFilter,
    setSiteFilter,
    dateMode,
    setDateMode,
    dateFilter,
    setDateFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    hasDateFilter,
    hasFilters,
    clearDateFilter,
    clearAllFilters,
    refetch,
  } = useSubcontractorInvoices();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  if (selectedId !== null) {
    return <InvoiceDetailView invoiceId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <>
      {showNewModal && (
        <NewInvoiceModal
          onClose={() => setShowNewModal(false)}
          onCreated={refetch}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Subcontractor Invoices</h2>
            <p className="text-sm text-blue-200/60">{total} total invoices</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-[#33907C] hover:bg-[#2a7566] text-white
                       text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg
                       shadow-[#33907C]/20"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <SearchInput value={search} onChange={setSearch} />

            <SiteFilterDropdown sites={sites} value={siteFilter} onChange={setSiteFilter} />

            <DateFilterDropdown
              dateMode={dateMode}
              setDateMode={setDateMode}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              hasDateFilter={hasDateFilter}
              clearDateFilter={clearDateFilter}
            />

            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-2"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          <SubcontractorInvoicesTable
            invoices={filtered}
            isLoading={isLoading}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </>
  );
}