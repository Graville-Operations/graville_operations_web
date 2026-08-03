'use client';

import { Coins, FileText, AlertTriangle, RefreshCw, MapPin, Search, X } from 'lucide-react';
import { useFinanceDashboard } from '@/hooks/finance/useFinanceDashboard';
import { CardSkeleton } from '@/components/finance/dashboard/CardSkeleton';
import { CompanyInvoiceOverviewCard } from '@/components/finance/dashboard/CompanyInvoiceOverviewCard';
import { SiteExpenseCard } from '@/components/finance/dashboard/SiteExpenseCard';

export default function FinanceDashboardPage() {
  const {
    siteStats,
    sitesLoading,
    sitesError,
    siteSearch,
    setSiteSearch,
    filteredStats,
    retryAll,
    retrySite,
    companyLoading,
    companyHasError,
    companyTotalAmount,
    companyTotalCount,
  } = useFinanceDashboard();

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Finance</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Coins size={13} className="text-[color:var(--primary)]" />
        <span className="text-sm text-[color:var(--muted-foreground)]">
          Financial overview across all sites and invoice types
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <div className="gv-card h-full flex items-start gap-4">
          <div className="gv-icon-box flex-shrink-0">
            <FileText size={18} className="text-[color:var(--primary)]" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium text-[color:var(--foreground)]">Finance Overview</p>
            <p className="text-sm text-[color:var(--muted-foreground)] leading-relaxed">
              Consolidated view of all financial activity across this company. Each card below
              represents a site, tap any expense row to view the full invoice list for that
              category on that site.
            </p>
          </div>
        </div>

        <CompanyInvoiceOverviewCard
          loading={companyLoading}
          hasError={companyHasError}
          count={companyTotalCount}
          amount={companyTotalAmount}
        />
      </div>

      {sitesError && (
        <div className="gv-card flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle size={28} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)] mb-4">Failed to load sites</p>
          <button
            onClick={retryAll}
            className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                       cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={10} /> Retry
          </button>
        </div>
      )}

      {!sitesError && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold text-[color:var(--foreground)] shrink-0">
              Site Expenses
            </h2>
            {!sitesLoading && siteStats.length > 0 && (
              <div className="relative flex items-center max-w-[220px] w-full">
                <Search size={12} className="absolute left-2.5 text-[color:var(--muted-foreground)] pointer-events-none" />
                <input
                  type="text"
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  placeholder="Search site…"
                  className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg
                             bg-[color:var(--gv-glass-bg)] border border-[color:var(--gv-glass-border)]
                             text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)]
                             focus:outline-none focus:border-[color:var(--primary)]
                             transition-colors"
                />
                {siteSearch && (
                  <button
                    onClick={() => setSiteSearch('')}
                    className="absolute right-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            )}
          </div>

          {sitesLoading ? (
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : siteStats.length === 0 ? (
            <div className="gv-card flex flex-col items-center justify-center py-10 text-center">
              <MapPin size={28} className="opacity-20 mb-3" />
              <p className="text-sm text-[color:var(--muted-foreground)]">No sites found</p>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="gv-card flex flex-col items-center justify-center py-10 text-center">
              <Search size={24} className="opacity-20 mb-3" />
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No sites match &ldquo;{siteSearch}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {filteredStats.map((s) => (
                <SiteExpenseCard
                  key={s.site.id}
                  siteStat={s}
                  onRetry={() => retrySite(s.site)}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}