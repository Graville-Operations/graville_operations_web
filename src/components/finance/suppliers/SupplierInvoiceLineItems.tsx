'use client';

import { Invoice } from '@/types/invoice';

interface SupplierInvoiceLineItemsProps {
  items: Invoice['items'];
  isEnriching: boolean;
}

export default function SupplierInvoiceLineItems({ items, isEnriching }: SupplierInvoiceLineItemsProps) {
  const hasItems = !!items && items.length > 0;

  if (!hasItems && !isEnriching) return null;

  return (
    <div className="gv-card p-0! overflow-hidden">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
        <p className="gv-eyebrow">Line Items</p>
      </div>

      {hasItems ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                {['Material', 'Quantity', 'Unit Price', 'Total'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--gv-brand)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items!.map((item, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--gv-text-primary)' }}>{item.particular}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--gv-text-muted)' }}>
                    KES {item.unit_price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--gv-brand)' }}>
                    KES {item.total_price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-3 rounded animate-pulse flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 rounded animate-pulse w-16" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 rounded animate-pulse w-20" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 rounded animate-pulse w-20" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}