import { InvoicePaymentStatus } from '@/types/company_invoices';

type StatusStyle = { bg: string; border: string; text: string; label: string };

const STATUS_STYLES: Record<InvoicePaymentStatus, StatusStyle> = {
  [InvoicePaymentStatus.PENDING]: {
    bg: 'rgba(217,119,6,0.12)',
    border: 'rgba(217,119,6,0.3)',
    text: '#d97706',
    label: 'Pending',
  },
  [InvoicePaymentStatus.PARTIALLY_PAID]: {
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.3)',
    text: '#3b82f6',
    label: 'Partially Paid',
  },
  [InvoicePaymentStatus.PAID]: {
    bg: 'rgba(51,144,124,0.12)',
    border: 'rgba(51,144,124,0.3)',
    text: '#33907c',
    label: 'Paid',
  },
  [InvoicePaymentStatus.REJECTED]: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    text: '#ef4444',
    label: 'Rejected',
  },
};

interface PaymentStatusBadgeProps {
  status: InvoicePaymentStatus;
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[InvoicePaymentStatus.PENDING];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
    >
      {style.label}
    </span>
  );
}