import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { ClientInvoiceListItem } from '@/types/client-invoice';
import { ROUTES } from '@/lib/routes';
import PaymentStatusBadge from '@/components/shared/PaymentStatusBadge';
import { InvoicePaymentStatus } from '@/types/company_invoices';

interface ClientInvoicesTableProps {
  invoices: ClientInvoiceListItem[];
  isLoading: boolean;
  onSelect: (id: number) => void;
}

export function ClientInvoicesTable({ invoices, isLoading, onSelect }: ClientInvoicesTableProps) {
  return (
    <div className="gv-card" style={{ padding: 0, overflow: 'hidden' }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--gv-brand)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : invoices.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-48 gap-2"
          style={{ color: 'var(--gv-text-faint)' }}
        >
          <Receipt size={40} className="opacity-30" />
          <p className="text-sm">No invoices found</p>
          <Link
            href={ROUTES.finance.invoice.client.new}
            className="text-xs mt-1 hover:underline"
            style={{ color: 'var(--gv-brand)' }}
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <table className="w-full">
          <thead
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid var(--gv-glass-border)',
            }}
          >
            <tr>
              {['Invoice No.', 'Client', 'Date', 'Amount (KES)', 'Status'].map((h) => (
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
            {invoices.map((inv, i) => (
              <tr
                key={inv.id}
                onClick={() => onSelect(inv.id)}
                className="transition-colors cursor-pointer hover:bg-white/5"
                style={{ borderTop: i > 0 ? '1px solid var(--gv-glass-border)' : undefined }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                      <Receipt size={14} style={{ color: 'var(--gv-brand)' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>
                      {inv.invoiceNo ?? '—'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  {inv.clientName ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  {inv.invoiceDate ?? '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>
                    {inv.total?.toLocaleString() ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <PaymentStatusBadge status={inv.paymentStatus ?? InvoicePaymentStatus.PENDING} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}