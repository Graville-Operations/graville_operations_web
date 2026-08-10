'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Ban, Banknote } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useCompanyInvoiceDetail } from '@/hooks/company-invoices/useCompanyInvoiceDetail';
import CompanyInvoiceDetailSkeleton from '@/components/finance/company/CompanyInvoiceDetailSkeleton';
import CompanyInvoiceHeader from '@/components/finance/company/CompanyInvoiceHeader';
import CompanyInvoiceMetaCard from '@/components/finance/company/CompanyInvoiceMetaCard';
import CompanyInvoiceLineItems from '@/components/finance/company/CompanyInvoiceLineItems';
import CompanyInvoiceSummary from '@/components/finance/company/CompanyInvoiceSummary';
import CompanyInvoiceNotes from '@/components/finance/company/CompanyInvoiceNotes';
import RejectInvoiceModal from '@/components/finance/shared/RejectInvoiceModal';
import RecordPaymentModal from '@/components/finance/shared/RecordPaymentModal';
import { InvoicePaymentStatus } from '@/types/company_invoices';
import { ROUTES } from '@/lib/routes';

export default function CompanyInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    invoice,
    loading,
    detailLoading,
    downloading,
    handleDownload,
    rejecting,
    paymentSubmitting,
    handleReject,
    handleRecordPayment,
  } = useCompanyInvoiceDetail(id);

  const [rejectModalOpen, setRejectModalOpen]   = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  const showRecordPayment =
    invoice.payment_status === InvoicePaymentStatus.PENDING ||
    invoice.payment_status === InvoicePaymentStatus.PARTIALLY_PAID;
  const showReject = invoice.payment_status === InvoicePaymentStatus.PENDING;

  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>
      <CompanyInvoiceHeader
        invoiceNumber={invoice.invoice_number}
        invoicedBy={invoice.invoiced_by}
        paymentStatus={invoice.payment_status}
        downloading={downloading}
        onBack={() => router.back()}
        onDownload={handleDownload}
        onViewPaymentHistory={() => router.push(ROUTES.finance.invoice.company.payments(String(invoice.id)))}
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

      {(showRecordPayment || showReject) && (
        <div className="flex items-center justify-end gap-2">
          {showRecordPayment && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907c' }}
            >
              <Banknote size={14} />
              Record Payment
            </button>
          )}

          {showReject && (
            <button
              onClick={() => setRejectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              <Ban size={14} />
              Reject
            </button>
          )}
        </div>
      )}

      <RejectInvoiceModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        invoiceNumber={invoice.invoice_number}
        submitting={rejecting}
        onConfirm={async () => {
          await handleReject();
          setRejectModalOpen(false);
        }}
      />

      <RecordPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        submitting={paymentSubmitting}
        totalInvoiced={invoice.total}
        remainingBalance={invoice.remaining_balance}
        onSubmit={async (payload) => {
          await handleRecordPayment(payload);
          setPaymentModalOpen(false);
        }}
      />
    </div>
  );
}