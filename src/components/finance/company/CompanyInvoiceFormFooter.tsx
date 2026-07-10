'use client';

import { Receipt } from 'lucide-react';

interface CompanyInvoiceFormFooterProps {
  totalAmount: number;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function CompanyInvoiceFormFooter({
  totalAmount,
  submitting,
  onCancel,
  onSubmit,
}: CompanyInvoiceFormFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className="flex items-center gap-4 px-5 py-3.5 rounded-xl"
        style={{ background: 'rgba(51,144,124,0.08)', border: '1px solid var(--gv-glass-border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
        <span className="text-xl font-bold" style={{ color: '#33907c' }}>KES {totalAmount.toLocaleString()}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand flex items-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Receipt size={15} /> Create Invoice
            </>
          )}
        </button>
      </div>
    </div>
  );
}