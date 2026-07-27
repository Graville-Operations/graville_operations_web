'use client';

import { useParams, useRouter } from 'next/navigation';
import { PaymentHistoryView } from '@/components/finance/subcontractor-invoices/PaymentHistoryView';

export default function ContractorPaymentHistoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = Number(params.id);

  return (
    <PaymentHistoryView
      invoiceId={invoiceId}
      onBack={() => router.push(`/finance/invoice/contractor/${invoiceId}`)}
    />
  );
}