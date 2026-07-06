'use client';

import { CompanyInvoice } from '@/types/company_invoices';
import EmptyState from '@/components/ui/emptystate';

function ShimmerCard() {
  return (
    <div className="gv-card space-y-3" style={{ padding: '14px 16px' }}>
      <div className="flex justify-between">
        <div className="h-3.5 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-3.5 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
      <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );
}

interface CompanyInvoiceCardsProps {
  invoices: CompanyInvoice[];
  isLoading: boolean;
  hasFilter: boolean;
  onSelect: (invoice: CompanyInvoice) => void;
  onCreateNew: () => void;
}

export default function CompanyInvoiceCards({
  invoices,
  isLoading,
  hasFilter,
  onSelect,
  onCreateNew,
}: CompanyInvoiceCardsProps) {
  return (
    <div className="space-y-2 md:hidden">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)
      ) : invoices.length === 0 ? (
        <EmptyState
          title={hasFilter ? 'No results for your filter' : 'No company invoices yet'}
          description={
            hasFilter
              ? 'Try a different search term or date range.'
              : 'Invoices you create will show up here.'
          }
          fullScreen={false}
          action={!hasFilter ? { label: 'New Invoice', onClick: onCreateNew } : undefined}
        />
      ) : (
        invoices.map((inv) => (
          <div
            key={inv.id}
            onClick={() => onSelect(inv)}
            className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
            style={{ padding: '14px 16px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: 'var(--gv-text-primary)' }}>#{inv.invoice_number}</span>
              <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{inv.invoice_date ?? '—'}</span>
            </div>
            <p className="text-sm mb-2.5" style={{ color: 'var(--gv-text-muted)' }}>{inv.invoiced_by ?? '—'}</p>
            <div className="flex items-center justify-end pt-2.5" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                KES {inv.total.toLocaleString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}