'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useSubcontractorInvoices } from '@/hooks/subcontractor-invoices/useSubcontractorInvoices';
import SearchInput from '@/components/finance/shared/SearchInput';
import SiteFilterDropdown from '@/components/finance/shared/SiteFilterDropdown';
import StatusFilterDropdown from '@/components/finance/shared/StatusFilterDropdown';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import { SubcontractorInvoicesTable } from '@/components/finance/subcontractor-invoices/SubcontractorInvoicesTable';
import { NewInvoiceModal } from '@/components/finance/subcontractor-invoices/NewInvoiceModal';
import type { SubcontractorInvoiceListItem } from '@/types/subcontractor-invoice';
import { ROUTES } from '@/lib/routes';

export default function SubcontractorInvoicesPage() {
  const router = useRouter();
  const {
    filtered,
    isLoading,
    total,
    sites,
    search,
    setSearch,
    siteFilter,
    setSiteFilter,
    statusFilter,
    setStatusFilter,
    dateFrom,
    dateTo,
    applyDateFilter,
    clearDateFilter,
    hasFilters,
    clearAllFilters,
    refetch,
  } = useSubcontractorInvoices();

  const [showNewModal, setShowNewModal] = useState(false);

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
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by invoice no or subcontractor..."
            />

            <SiteFilterDropdown sites={sites} value={siteFilter} onChange={setSiteFilter} />

            <StatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />

            <DateFilterDropdown
              from={dateFrom}
              to={dateTo}
              onApply={applyDateFilter}
              onClear={clearDateFilter}
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
            onSelect={(inv: SubcontractorInvoiceListItem) =>
              router.push(ROUTES.finance.invoice.contractor.detail(inv.id))
            }
          />
        </div>
      </div>
    </>
  );
}