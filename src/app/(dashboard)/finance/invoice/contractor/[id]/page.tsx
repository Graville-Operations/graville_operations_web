'use client';

import { useParams, useRouter } from 'next/navigation';
import { InvoiceDetailView } from '@/components/finance/subcontractor-invoices/InvoiceDetailView';

export default function ContractorInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = Number(params.id);

  return (
    <InvoiceDetailView
      invoiceId={invoiceId}
      onBack={() => router.push('/finance/invoice/contractor')}
    />
  );
}