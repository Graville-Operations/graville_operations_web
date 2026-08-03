'use client';

import { useParams, useRouter } from 'next/navigation';
import { InvoiceDetailView } from '@/components/finance/subcontractor-invoices/InvoiceDetailView';
import { ROUTES } from '@/lib/routes';

export default function ContractorInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = Number(params.id);

  return (
    <InvoiceDetailView
      invoiceId={invoiceId}
      onBack={() => router.push(ROUTES.finance.invoice.contractor.list)}
    />
  );
}