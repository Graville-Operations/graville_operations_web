'use client';

import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { getStatusStyle } from '@/lib/utils/invoice-status';

interface SupplierInvoiceHeaderProps {
  invoice: Invoice;
  isEnriching: boolean;
  downloading: boolean;
  onBack: () => void;
  onDownload: () => void;
}

export default function SupplierInvoiceHeader({
  invoice,
  isEnriching,
  downloading,
  onBack,
  onDownload,
}: SupplierInvoiceHeaderProps) {
  const st = getStatusStyle(invoice.status);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2 rounded-xl"
        style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
      >
        <ArrowLeft size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold truncate" style={{ color: 'var(--gv-text-primary)' }}>
          Invoice {invoice.invoice_number}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>{invoice.supplier_name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isEnriching && (
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gv-brand)' }} />
        )}
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: st.bg, color: st.color }}>
          {invoice.status.replace(/_/g, ' ')}
        </span>
        <button
          onClick={onDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907c' }}
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}