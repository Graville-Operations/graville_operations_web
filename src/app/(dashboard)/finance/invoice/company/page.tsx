'use client';

import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCompanyInvoices } from '@/hooks/company-invoices/useCompanyInvoices';
import SearchInput from '@/components/finance/suppliers/SearchInput';
import CompanyDateFilterDropdown from '@/components/finance/company/DateFilterDropdown';
import CompanyInvoicesTable from '@/components/finance/company/CompanyInvoicesTable';
import CompanyInvoiceCards from '@/components/finance/company/CompanyInvoiceCards';
import { ROUTES } from '@/lib/routes';

export default function CompanyInvoicesPage() {
  const router = useRouter();
  const {
    filtered,
    isLoading,
    search,
    setSearch,
    appliedLabel,
    applyDateFilter,
    clearDateFilter,
    openDetail,
    hasFilter,
  } = useCompanyInvoices();

  const goToCreate = () => router.push(ROUTES.finance.invoice.company.create);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>Company Invoices</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={goToCreate}
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="gv-card p-3!">
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by invoice no, invoiced by..."
          />

          <CompanyDateFilterDropdown
            appliedLabel={appliedLabel}
            onApply={applyDateFilter}
            onClear={clearDateFilter}
          />

          {appliedLabel && (
            <button
              onClick={clearDateFilter}
              className="p-2 rounded-lg shrink-0"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <CompanyInvoicesTable
        invoices={filtered}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onSelect={openDetail}
        onCreateNew={goToCreate}
      />

      <CompanyInvoiceCards
        invoices={filtered}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onSelect={openDetail}
        onCreateNew={goToCreate}
      />
    </div>
  );
}