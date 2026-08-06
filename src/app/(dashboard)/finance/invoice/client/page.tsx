'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useClientInvoices } from '@/hooks/client-invoices/useClientInvoices';
import SearchInput from '@/components/finance/shared/SearchInput';
import SiteFilterDropdown from '@/components/finance/shared/SiteFilterDropdown';
import DateFilterDropdown from '@/components/finance/shared/DateFilterDropdown';
import StatusFilterDropdown from '@/components/finance/shared/StatusFilterDropdown';
import { ClientInvoicesTable } from '@/components/finance/client-invoices/ClientInvoicesTable';
import { ROUTES } from '@/lib/routes';

export default function ClientInvoicesPage() {
  const router = useRouter();
  const {
    filtered, search, setSearch, isLoading, total, sites,
    siteId, setSiteId,
    dateFrom, dateTo, activeDateLabel, applyDateFilter, clearDateFilter, clearAllFilters,
    statusFilter, setStatusFilter,
    hasActiveFilters,
  } = useClientInvoices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            Client Invoices
          </h2>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {total} total invoices
          </p>
        </div>
        <Link href={ROUTES.finance.invoice.client.new} className="gv-btn-brand gap-2 text-sm">
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      <div className="gv-card" style={{ overflow: 'visible' }}>
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by invoice number or client name..."
          />

          <SiteFilterDropdown sites={sites} value={siteId} onChange={setSiteId} />

          <DateFilterDropdown
            from={dateFrom}
            to={dateTo}
            appliedLabel={activeDateLabel}
            onApply={applyDateFilter}
            onClear={clearDateFilter}
          />

          <StatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="shrink-0 text-xs underline transition-colors"
              style={{ color: 'var(--gv-text-faint)' }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <ClientInvoicesTable
        invoices={filtered}
        isLoading={isLoading}
        onSelect={(id) => router.push(ROUTES.finance.invoice.client.detail(String(id)))}
      />
    </div>
  );
}