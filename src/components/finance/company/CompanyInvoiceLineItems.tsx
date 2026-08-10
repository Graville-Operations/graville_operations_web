'use client';

import { CompanyInvoice } from '@/types/company_invoices';
import { PulseBox } from '@/components/shared/Shimmer';

interface CompanyInvoiceLineItemsProps {
  items: CompanyInvoice['items'];
  isDetailLoading: boolean;
}

export default function CompanyInvoiceLineItems({ items, isDetailLoading }: CompanyInvoiceLineItemsProps) {
  const hasItems = !!items && items.length > 0;
  const showShimmer = isDetailLoading && !hasItems;

  if (!hasItems && !showShimmer) return null;

  return (
    <div className="gv-card p-0! overflow-hidden">
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
        <p className="gv-eyebrow text-label-sm">Line Items</p>
      </div>

      {showShimmer ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
            <PulseBox w="20px" h="13px" /><PulseBox w="200px" h="13px" />
            <PulseBox w="40px" h="13px" /><PulseBox w="80px" h="13px" /><PulseBox w="80px" h="13px" />
          </div>
        ))
      ) : (
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
              {['', 'Particulars', 'Quantity', 'Unit Price', 'Total'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#33907c' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items!.map((item, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{item.index}</td>
                <td className="px-5 py-3.5 text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{item.particulars}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  KES {item.unit_price.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: '#33907c' }}>
                  KES {item.total_amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}