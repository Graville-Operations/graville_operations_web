'use client';

import { PulseBox } from '@/components/shared/Shimmer';

interface CompanyInvoiceMetaCardProps {
  invoiceDate: string | null;
  invoicedBy: string | null;
  createdAt: string | null;
  isDetailLoading: boolean;
}

export default function CompanyInvoiceMetaCard({
  invoiceDate,
  invoicedBy,
  createdAt,
  isDetailLoading,
}: CompanyInvoiceMetaCardProps) {
  const fields = [
    { label: 'Invoice Date', value: invoiceDate ?? '—', shimmer: false },
    { label: 'Invoiced By',  value: invoicedBy ?? '—',  shimmer: false },
    { label: 'Created On',   value: createdAt,          shimmer: isDetailLoading && !createdAt },
  ];

  return (
    <div className="gv-card">
      <div className="grid grid-cols-4 gap-x-6 gap-y-4">
        {fields.map(({ label, value, shimmer }) => (
          <div key={label}>
            <p className="gv-eyebrow mb-0.5 text-label-sm">{label}</p>
            {shimmer ? (
              <PulseBox w="100px" h="14px" />
            ) : (
              <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value ?? '—'}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}