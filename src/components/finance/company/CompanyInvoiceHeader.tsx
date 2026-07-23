'use client';

import { Loader2, ArrowLeft, Download, History } from 'lucide-react';
import { InvoicePaymentStatus } from '@/types/company_invoices';
import PaymentStatusBadge from '@/components/shared/PaymentStatusBadge';

interface CompanyInvoiceHeaderProps {
  invoiceNumber: string;
  invoicedBy: string | null;
  paymentStatus: InvoicePaymentStatus;
  downloading: boolean;
  onBack: () => void;
  onDownload: () => void;
  onViewPaymentHistory: () => void;
}

export default function CompanyInvoiceHeader({
  invoiceNumber,
  invoicedBy,
  paymentStatus,
  downloading,
  onBack,
  onDownload,
  onViewPaymentHistory,
}: CompanyInvoiceHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
              Invoice {invoiceNumber}
            </h2>
            <PaymentStatusBadge status={paymentStatus} />
          </div>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {invoicedBy ?? 'Company Invoice'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onViewPaymentHistory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-primary)' }}
        >
          <History size={14} />
          Payment History
        </button>

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
    </div>
  );
}