'use client';

import { Eye } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { getStatusStyle } from '@/lib/utils/invoice-status';
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

interface SupplierInvoiceCardsProps {
  invoices: Invoice[];
  isLoading: boolean;
  hasFilter: boolean;
  onSelect: (invoice: Invoice) => void;
}

export default function SupplierInvoiceCards({
  invoices,
  isLoading,
  hasFilter,
  onSelect,
}: SupplierInvoiceCardsProps) {
  return (
    <div className="space-y-2 md:hidden">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)
      ) : invoices.length === 0 ? (
        <EmptyState
          title={hasFilter ? 'No invoices match your filters' : 'No invoices yet'}
          description={
            hasFilter
              ? 'Try a different search term, site, or date range.'
              : 'Supplier invoices you receive will show up here.'
          }
          fullScreen={true}
        />
      ) : (
        invoices.map((inv) => {
          const st = getStatusStyle(inv.status);
          return (
            <div
              key={inv.id}
              onClick={() => onSelect(inv)}
              className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: '14px 16px' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold" style={{ color: 'var(--gv-text-primary)' }}>
                  {inv.invoice_number}
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: st.bg, color: st.color }}
                >
                  {inv.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--gv-text-muted)' }}>{inv.supplier_name}</p>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {inv.submitted_by && (
                  <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>by {inv.submitted_by}</span>
                )}
                {inv.invoice_date && (
                  <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>· {inv.invoice_date}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                  KES {inv.total_amount.toLocaleString()}
                </span>
                <Eye size={14} style={{ color: 'var(--gv-text-subtle)' }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}