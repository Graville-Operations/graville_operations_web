'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useClientInvoices } from '@/hooks/client-invoices/useClientInvoices';
import { SearchInput } from '@/components/finance/client-invoices/SearchInput';
import { SiteFilterDropdown } from '@/components/finance/client-invoices/SiteFilterDropdown';
import { DateFilterDropdown } from '@/components/finance/client-invoices/DateFilterDropdown';
import { ClientInvoicesTable } from '@/components/finance/client-invoices/ClientInvoicesTable';
import { ROUTES } from '@/lib/routes';

export default function ClientInvoicesPage() {
  const router = useRouter();
  const {
    calendarRef, siteRef, today,
    filtered, search, setSearch, isLoading, total, sites,
    selectedSite, selectSite, siteOpen, toggleSiteDropdown,
    calendarOpen, toggleCalendarDropdown, dateMode, setDateMode,
    singleDate, setSingleDate, dateFrom, setDateFrom, dateTo, setDateTo,
    activeDateLabel, applyDateFilter, clearDateFilter, clearAllFilters,
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
          <SearchInput value={search} onChange={setSearch} />

          <SiteFilterDropdown
            siteRef={siteRef}
            sites={sites}
            selectedSite={selectedSite}
            siteOpen={siteOpen}
            onToggle={toggleSiteDropdown}
            onSelect={selectSite}
          />

          <DateFilterDropdown
            calendarRef={calendarRef}
            calendarOpen={calendarOpen}
            onToggle={toggleCalendarDropdown}
            activeDateLabel={activeDateLabel}
            dateMode={dateMode}
            setDateMode={setDateMode}
            singleDate={singleDate}
            setSingleDate={setSingleDate}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            today={today}
            onApply={applyDateFilter}
            onClear={clearDateFilter}
          />

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