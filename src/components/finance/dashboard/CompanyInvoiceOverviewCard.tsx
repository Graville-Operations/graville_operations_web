'use client';

import { useRouter } from 'next/navigation';
import { Building2, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { formatAmount } from './format';

interface CompanyInvoiceOverviewCardProps {
  loading:  boolean;
  hasError: boolean;
  count:    number;
  amount:   number;
}

export function CompanyInvoiceOverviewCard({
  loading,
  hasError,
  count,
  amount,
}: CompanyInvoiceOverviewCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(ROUTES.finance.invoice.company.list)}
      className="gv-card h-full w-full min-w-0 flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 text-left
                 hover:border-[color:var(--gv-glass-border-hover)] transition-colors"
    >
      <div className="gv-icon-box flex-shrink-0">
        <Building2 size={18} className="text-[color:var(--primary)]" />
      </div>
      <div className="flex-1 min-w-[8rem] basis-32">
        <p className="text-sm font-medium text-[color:var(--foreground)]">Company Invoices</p>
        <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
          Aggregated across all sites
        </p>
      </div>

      {loading ? (
        <div className="h-6 w-24 rounded bg-white/5 animate-pulse flex-shrink-0" />
      ) : hasError ? (
        <span className="text-xs text-[color:var(--muted-foreground)] flex-shrink-0">Partial data</span>
      ) : (
        <div className="text-right min-w-0 ml-auto">
          <p className="text-base sm:text-lg font-semibold break-words text-[color:var(--foreground)] tabular-nums">
            {formatAmount(amount)} <span className="text-xs font-normal text-[color:var(--muted-foreground)]">KES</span>
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)]">{count} invoice{count === 1 ? '' : 's'}</p>
        </div>
      )}

      <ChevronRight size={16} className="text-[color:var(--gv-text-faint)] flex-shrink-0 hidden sm:block" />
    </button>
  );
}