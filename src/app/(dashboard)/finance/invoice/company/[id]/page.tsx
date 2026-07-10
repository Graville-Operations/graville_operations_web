'use client';

import { useParams, useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/emptystate';
import { useCompanyInvoiceDetail } from '@/hooks/company-invoices/useCompanyInvoiceDetail';
import CompanyInvoiceDetailSkeleton from '@/components/finance/company/CompanyInvoiceDetailSkeleton';
import CompanyInvoiceHeader from '@/components/finance/company/CompanyInvoiceHeader';
import CompanyInvoiceMetaCard from '@/components/finance/company/CompanyInvoiceMetaCard';
import CompanyInvoiceLineItems from '@/components/finance/company/CompanyInvoiceLineItems';
import CompanyInvoiceSummary from '@/components/finance/company/CompanyInvoiceSummary';
import CompanyInvoiceNotes from '@/components/finance/company/CompanyInvoiceNotes';

export default function CompanyInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { invoice, loading, detailLoading, downloading, handleDownload } = useCompanyInvoiceDetail(id);

  if (loading && !invoice) return <CompanyInvoiceDetailSkeleton />;

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice may have been removed or the link is incorrect."
        fullScreen={false}
        action={{ label: 'Go Back', onClick: () => router.back() }}
      />
    );
  }

  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>
      <CompanyInvoiceHeader
        invoiceNumber={invoice.invoice_number}
        invoicedBy={invoice.invoiced_by}
        downloading={downloading}
        onBack={() => router.back()}
        onDownload={handleDownload}
      />

      <CompanyInvoiceMetaCard
        invoiceDate={invoice.invoice_date}
        invoicedBy={invoice.invoiced_by}
        createdAt={invoice.created_at}
        isDetailLoading={detailLoading}
      />

      <CompanyInvoiceLineItems items={invoice.items} isDetailLoading={detailLoading} />

      <div className="grid grid-cols-2 gap-4">
        <CompanyInvoiceSummary total={invoice.total} />
        <CompanyInvoiceNotes notes={invoice.notes} isDetailLoading={detailLoading} />
      </div>
    </div>
  );
}