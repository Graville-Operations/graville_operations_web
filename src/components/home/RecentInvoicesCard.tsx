import Link from 'next/link';
import { Receipt, ArrowRight, Loader2 } from 'lucide-react';
import { InvoiceItem } from '@/store/invoice-store';
import { ROUTES } from '@/lib/routes';

interface RecentInvoicesCardProps {
  invoices: InvoiceItem[];
  loading: boolean;
}

export function RecentInvoicesCard({ invoices, loading }: RecentInvoicesCardProps) {
  return (
    <div className="gv-card overflow-hidden flex flex-col" style={{ padding: 0 }}>
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
            <Receipt size={15} style={{ color: '#33907c' }} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--gv-text-primary)' }}>
            Client Invoices
          </h3>
        </div>
        <Link
          href={ROUTES.finance.invoice.client.list}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: '#33907c' }}
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex-1 px-5 py-3 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin" style={{ color: '#33907c' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Receipt size={32} style={{ color: 'var(--gv-text-faint)' }} className="mb-2" />
            <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>No invoices yet</p>
          </div>
        ) : (
          invoices.map((inv, idx) => (
            <Link
              key={inv.id}
              href={ROUTES.finance.invoice.client.detail(String(inv.id))}
              className="flex items-center justify-between py-2.5 rounded-lg px-2 hover:bg-white/5 transition-colors"
              style={{ borderBottom: idx < invoices.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(51,144,124,0.12)' }}
                >
                  <Receipt size={14} style={{ color: '#33907c' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--gv-text-primary)' }}>
                    {inv.invoiceNo}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--gv-text-subtle)' }}>
                    {inv.clientName}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold" style={{ color: '#33907c' }}>
                  KES {inv.total?.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
                  {inv.invoiceDate}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {!loading && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          <Link
            href={ROUTES.finance.invoice.client.new}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(51,144,124,0.10)', color: '#33907c', border: '1px solid rgba(51,144,124,0.20)' }}
          >
            <Receipt size={14} /> Submit New Invoice
          </Link>
        </div>
      )}
    </div>
  );
}