'use client';

import { CompanyInvoice } from '@/types/company_invoices';
import EmptyState from '@/components/ui/emptystate';

const HEADERS = ['Invoice No', 'Invoiced By', 'Invoice Date', 'Total'];

function ShimmerRow() {
  return (
    <tr>
      {HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 rounded animate-pulse"
            style={{
              background: 'rgba(255,255,255,0.07)',
              width: i === 0 ? '80px' : i === 3 ? '60px' : '100px',
            }}
          />
        </td>
      ))}
    </tr>
  );
}

interface CompanyInvoicesTableProps {
  invoices: CompanyInvoice[];
  isLoading: boolean;
  hasFilter: boolean;
  onSelect: (invoice: CompanyInvoice) => void;
  onCreateNew: () => void;
}

export default function CompanyInvoicesTable({
  invoices,
  isLoading,
  hasFilter,
  onSelect,
  onCreateNew,
}: CompanyInvoicesTableProps) {
  return (
    <div className="gv-card p-0! overflow-hidden hidden md:block">
      <table className="w-full">
        <thead>
          <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#33907c' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={HEADERS.length}>
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
              </td>
            </tr>
          ) : (
            invoices.map((inv, idx) => (
              <tr
                key={inv.id}
                onClick={() => onSelect(inv)}
                className="cursor-pointer"
                style={{
                  borderBottom: idx < invoices.length - 1 ? '1px solid var(--gv-glass-border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                  {inv.invoice_number}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  {inv.invoiced_by ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  {inv.invoice_date ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                  KES {inv.total.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}