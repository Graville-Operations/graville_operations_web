'use client';

interface CompanyInvoiceSummaryProps {
  total: number;
}

export default function CompanyInvoiceSummary({ total }: CompanyInvoiceSummaryProps) {
  return (
    <div className="gv-card flex items-center justify-between">
      <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
      <span className="text-2xl font-bold" style={{ color: '#33907c' }}>KES {total.toLocaleString()}</span>
    </div>
  );
}