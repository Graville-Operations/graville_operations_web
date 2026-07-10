'use client';

import { Invoice } from '@/types/invoice';

interface SupplierInvoiceMetaCardProps {
  invoice: Invoice;
  isEnriching: boolean;
}

export default function SupplierInvoiceMetaCard({ invoice, isEnriching }: SupplierInvoiceMetaCardProps) {
  const fields = [
    { label: 'Invoice Date', value: invoice.invoice_date ?? '—' },
    { label: 'Created On',   value: invoice.created_at ?? '—' },
    { label: 'LPO Number',   value: invoice.lpo_number ?? '—' },
    { label: 'Delivery No.', value: invoice.delivery_number ?? '—' },
    { label: 'Requested By', value: invoice.submitted_by ?? '—' },
    { label: 'Site',         value: invoice.site ?? '—' },
  ];

  return (
    <div className="gv-card">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <p className="gv-eyebrow mb-1">{label}</p>
            {value === '—' && isEnriching ? (
              <div className="h-3.5 w-24 rounded animate-pulse mt-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            ) : (
              <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}