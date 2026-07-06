'use client';

interface SupplierInvoiceSummaryProps {
  totalAmount: number;
  amountPaid: number;
  balance: number;
}

export default function SupplierInvoiceSummary({
  totalAmount,
  amountPaid,
  balance,
}: SupplierInvoiceSummaryProps) {
  return (
    <div className="gv-card space-y-3">
      <div className="flex justify-between text-sm">
        <span style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
        <span className="font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          KES {totalAmount.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span style={{ color: 'var(--gv-text-muted)' }}>Amount Paid</span>
        <span className="font-bold" style={{ color: 'var(--gv-brand)' }}>
          KES {amountPaid.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
        <span style={{ color: 'var(--gv-text-muted)' }}>Balance Due</span>
        <span className="font-bold" style={{ color: balance > 0 ? 'var(--destructive)' : 'var(--gv-brand)' }}>
          KES {balance.toLocaleString()}
        </span>
      </div>
    </div>
  );
}