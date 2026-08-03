'use client';

import { useParams, useRouter } from 'next/navigation';
import { PaymentHistoryView } from '@/components/finance/subcontractor-invoices/PaymentHistoryView';
import { ROUTES } from '@/lib/routes';

export default function ContractorPaymentHistoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = Number(params.id);

  return (
    <PaymentHistoryView
      invoiceId={invoiceId}
      onBack={() => router.push(ROUTES.finance.invoice.contractor.detail(invoiceId))}
    />
  );
}