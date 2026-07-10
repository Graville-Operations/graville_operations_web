'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useSupplierInvoiceDetail } from '@/hooks/supplier-invoices/useSupplierInvoiceDetail';
import SupplierInvoiceHeader from '@/components/finance/suppliers/SupplierInvoiceHeader';
import SupplierInvoiceMetaCard from '@/components/finance/suppliers/SupplierInvoiceMetaCard';
import SupplierInvoiceLineItems from '@/components/finance/suppliers/SupplierInvoiceLineItems';
import SupplierInvoiceSummary from '@/components/finance/suppliers/SupplierInvoiceSummary';
import SupplierInvoiceNotes from '@/components/finance/suppliers/SupplierInvoiceNotes';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { invoice, isLoading, isEnriching, downloading, handleDownload, balance } =
    useSupplierInvoiceDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gv-brand)' }} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice may have been removed or the link is incorrect."
        fullScreen={false}
        action={{ label: 'Go back', onClick: () => router.back() }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SupplierInvoiceHeader
        invoice={invoice}
        isEnriching={isEnriching}
        downloading={downloading}
        onBack={() => router.back()}
        onDownload={handleDownload}
      />

      <SupplierInvoiceMetaCard invoice={invoice} isEnriching={isEnriching} />

      <SupplierInvoiceLineItems items={invoice.items} isEnriching={isEnriching} />

      <SupplierInvoiceSummary
        totalAmount={invoice.total_amount}
        amountPaid={invoice.amount_paid}
        balance={balance}
      />

      <SupplierInvoiceNotes notes={invoice.notes} isEnriching={isEnriching} />
    </div>
  );
}