'use client';

import { ArrowLeft, Loader2, Download, History } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import PaymentStatusBadge from '@/components/shared/PaymentStatusBadge';

interface SupplierInvoiceHeaderProps {
  invoice: Invoice;
  isEnriching: boolean;
  downloading: boolean;
  onBack: () => void;
  onDownload: () => void;
  onViewPaymentHistory: () => void;
}

export default function SupplierInvoiceHeader({
  invoice,
  isEnriching,
  downloading,
  onBack,
  onDownload,
  onViewPaymentHistory,
}: SupplierInvoiceHeaderProps) {
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
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold truncate" style={{ color: 'var(--gv-text-primary)' }}>
            Invoice {invoice.invoice_number}
          </h2>
          <PaymentStatusBadge status={invoice.status} />
        </div>
        <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>{invoice.supplier_name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isEnriching && (
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gv-brand)' }} />
        )}

        <button
          onClick={onViewPaymentHistory}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-primary)' }}
        >
          <History size={14} />
          Payment History
        </button>

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