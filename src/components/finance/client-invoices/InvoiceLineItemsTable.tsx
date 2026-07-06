import { ClientInvoiceDetail } from '@/types/client-invoice';

export function InvoiceLineItemsTable({ invoice }: { invoice: ClientInvoiceDetail }) {
  return (
    <div className="gv-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>Line Items</h3>
      </div>
      <table className="w-full">
        <thead style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--gv-glass-border)' }}>
          <tr>
            {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gv-text-subtle)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(invoice.items ?? []).map((item, i) => (
            <tr
              key={item.id}
              className="transition-colors hover:bg-white/5"
              style={{ borderTop: i > 0 ? '1px solid var(--gv-glass-border)' : undefined }}
            >
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{item.index}</td>
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-primary)' }}>{item.particulars}</td>
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{item.unitPrice?.toLocaleString() ?? '—'}</td>
              <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>{item.totalAmount?.toLocaleString() ?? '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid var(--gv-glass-border)' }}>
          <tr>
            <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--gv-text-muted)' }}>
              Grand Total
            </td>
            <td className="px-6 py-4 text-sm font-bold" style={{ color: 'var(--gv-brand)' }}>
              {invoice.total?.toLocaleString() ?? '—'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}