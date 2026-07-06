import { ClientInvoiceDetail } from '@/types/client-invoice';

export function InvoiceMetaCard({ invoice }: { invoice: ClientInvoiceDetail }) {
  return (
    <div className="gv-card grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <p className="gv-eyebrow mb-1">Invoice No.</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{invoice.invoiceNo}</p>
      </div>
      <div>
        <p className="gv-eyebrow mb-1">Client</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{invoice.clientName}</p>
      </div>
      <div>
        <p className="gv-eyebrow mb-1">Invoice Date</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{invoice.invoiceDate ?? '—'}</p>
      </div>
      <div>
        <p className="gv-eyebrow mb-1">Total (KES)</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>{invoice.total?.toLocaleString() ?? '—'}</p>
      </div>
      <div>
        <p className="gv-eyebrow mb-1">Created By</p>
        <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{invoice.createdBy?.name ?? '—'}</p>
      </div>
      <div>
        <p className="gv-eyebrow mb-1">Created At</p>
        <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{invoice.created_at ?? '—'}</p>
      </div>
      {invoice.notes && (
        <div className="col-span-2 md:col-span-4">
          <p className="gv-eyebrow mb-1">Notes</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}