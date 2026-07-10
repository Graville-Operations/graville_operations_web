'use client';

import { ArrowLeft, Loader2, Download } from 'lucide-react';

interface CompanyInvoiceHeaderProps {
  invoiceNumber: string;
  invoicedBy: string | null;
  downloading: boolean;
  onBack: () => void;
  onDownload: () => void;
}

export default function CompanyInvoiceHeader({
  invoiceNumber,
  invoicedBy,
  downloading,
  onBack,
  onDownload,
}: CompanyInvoiceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            Invoice {invoiceNumber}
          </h2>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {invoicedBy ?? 'Company Invoice'}
          </p>
        </div>
      </div>
      <button
        onClick={onDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907c' }}
      >
        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {downloading ? 'Preparing…' : 'Download PDF'}
      </button>
    </div>
  );
}