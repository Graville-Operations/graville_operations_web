'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Ban, Banknote } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useSupplierInvoiceDetail } from '@/hooks/supplier-invoices/useSupplierInvoiceDetail';
import SupplierInvoiceHeader from '@/components/finance/suppliers/SupplierInvoiceHeader';
import SupplierInvoiceMetaCard from '@/components/finance/suppliers/SupplierInvoiceMetaCard';
import SupplierInvoiceLineItems from '@/components/finance/suppliers/SupplierInvoiceLineItems';
import SupplierInvoiceSummary from '@/components/finance/suppliers/SupplierInvoiceSummary';
import SupplierInvoiceNotes from '@/components/finance/suppliers/SupplierInvoiceNotes';
import RejectInvoiceModal from '@/components/finance/suppliers/RejectInvoiceModal';
import RecordPaymentModal from '@/components/finance/suppliers/RecordPaymentModal';
import { InvoicePaymentStatus } from '@/types/invoice';
import { ROUTES } from '@/lib/routes';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    invoice, isLoading, isEnriching, downloading, handleDownload, balance,
    rejecting, paymentSubmitting, handleReject, handleRecordPayment,
  } = useSupplierInvoiceDetail(id);

  const [rejectModalOpen, setRejectModalOpen]   = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  const showRecordPayment =
    invoice.status === InvoicePaymentStatus.PENDING ||
    invoice.status === InvoicePaymentStatus.PARTIALLY_PAID;
  const showReject = invoice.status === InvoicePaymentStatus.PENDING;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SupplierInvoiceHeader
        invoice={invoice}
        isEnriching={isEnriching}
        downloading={downloading}
        onBack={() => router.back()}
        onDownload={handleDownload}
        onViewPaymentHistory={() => router.push(ROUTES.finance.invoice.supplier.payments(String(invoice.id)))}
      />

      <SupplierInvoiceMetaCard invoice={invoice} isEnriching={isEnriching} />

      <SupplierInvoiceLineItems items={invoice.items} isEnriching={isEnriching} />

      <SupplierInvoiceSummary
        totalAmount={invoice.total_amount}
        amountPaid={invoice.amount_paid}
        balance={balance}
      />

      <SupplierInvoiceNotes notes={invoice.notes} isEnriching={isEnriching} />

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
        totalInvoiced={invoice.total_amount}
        remainingBalance={invoice.remaining_balance ?? balance}
        onSubmit={async (payload) => {
          await handleRecordPayment(payload);
          setPaymentModalOpen(false);
        }}
      />
    </div>
  );
}