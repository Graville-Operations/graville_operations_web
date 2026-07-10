'use client';

import { Invoice } from '@/types/invoice';
import { getStatusStyle } from '@/lib/utils/invoice-status';
import EmptyState from '@/components/ui/emptystate';

const HEADERS = ['Invoice No', 'Supplier', 'Invoiced By', 'Date', 'Amount', 'Status'];

function ShimmerRow() {
  return (
    <tr>
      {HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 rounded animate-pulse"
            style={{
              background: 'rgba(255,255,255,0.07)',
              width: i === 0 ? '80px' : i === 4 ? '60px' : '100px',
            }}
          />
        </td>
      ))}
    </tr>
  );
}

interface SupplierInvoicesTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  hasFilter: boolean;
  onSelect: (invoice: Invoice) => void;
}

export default function SupplierInvoicesTable({
  invoices,
  isLoading,
  hasFilter,
  onSelect,
}: SupplierInvoicesTableProps) {
  return (
    <div className="gv-card p-0! overflow-hidden hidden md:block">
      {isLoading ? (
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
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerRow key={i} />
            ))}
          </tbody>
        </table>
      ) : invoices.length === 0 ? (
        <EmptyState
          title={hasFilter ? 'No invoices match your filters' : 'No invoices yet'}
          description={
            hasFilter
              ? 'Try a different search term, site, or date range.'
              : 'Supplier invoices you receive will show up here.'
          }
          fullScreen={false}
        />
      ) : (
        <div className="overflow-x-auto">
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
              {invoices.map((inv, idx) => {
                const st = getStatusStyle(inv.status);
                return (
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
                      {inv.supplier_name}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                      {inv.submitted_by ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                      {inv.invoice_date ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>
                      KES {inv.total_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}