'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Download, Ban, Banknote, History } from 'lucide-react';
import InvoiceDetailSkeleton from '@/components/shared/InvoiceDetailSkeleton';
import { useClientInvoiceDetail } from '@/hooks/client-invoices/useClientInvoiceDetail';
import { InvoiceMetaCard } from '@/components/finance/client-invoices/InvoiceMetaCard';
import { InvoiceLineItemsTable } from '@/components/finance/client-invoices/InvoiceLineItemsTable';
import PaymentStatusBadge from '@/components/shared/PaymentStatusBadge';
import { InvoicePaymentStatus } from '@/types/client-invoice';
import RejectInvoiceModal from '@/components/finance/shared/RejectInvoiceModal';
import RecordPaymentModal from '@/components/finance/shared/RecordPaymentModal';
import { ROUTES } from '@/lib/routes';

export default function ClientInvoiceDetailPage() {
  const router = useRouter();
  const {
    id, invoice, isLoading, isExporting, error, retryIn, preview, load, handleDownload,
    rejecting, paymentSubmitting, handleReject, handleRecordPayment,
  } = useClientInvoiceDetail();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  if (isLoading || retryIn !== null) {
    return (
      <InvoiceDetailSkeleton
        invoiceNo={preview.invoiceNo}
        clientName={preview.clientName}
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--gv-text-faint)' }}>
        <Receipt size={48} className="opacity-30" />
        <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => id && load(id)}
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--gv-brand)' }}
          >
            Try again
          </button>
          <button
            onClick={() => router.back()}
            className="text-xs hover:underline"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--gv-text-faint)' }}>
        <Receipt size={48} className="opacity-30" />
        <p className="text-sm">Invoice not found</p>
        <button onClick={() => router.back()} className="text-xs hover:underline" style={{ color: 'var(--gv-brand)' }}>
          Go back
        </button>
      </div>
    );
  }

  const showRecordPayment =
    invoice.paymentStatus === InvoicePaymentStatus.PENDING ||
    invoice.paymentStatus === InvoicePaymentStatus.PARTIALLY_PAID;
  const showReject = invoice.paymentStatus === InvoicePaymentStatus.PENDING;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
                Invoice {invoice.invoiceNo}
              </h2>
              <PaymentStatusBadge status={invoice.paymentStatus} />
            </div>
            <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
              Client: {invoice.clientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(ROUTES.finance.invoice.client.payments(String(invoice.id)))}
            className="gv-btn-pill gap-2 text-sm"
          >
            <History size={15} />
            Payment History
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="gv-btn-brand gap-2 text-sm"
            style={{ opacity: isExporting ? 0.6 : 1, transition: 'opacity 0.2s' }}
          >
            {isExporting ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.7)', borderTopColor: 'transparent' }}
                />
                Exporting…
              </>
            ) : (
              <>
                <Download size={15} />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <InvoiceMetaCard invoice={invoice} />
      <InvoiceLineItemsTable invoice={invoice} />

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
        invoiceNumber={invoice.invoiceNo}
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
        remainingBalance={invoice.remainingBalance}
        onSubmit={async (payload) => {
          await handleRecordPayment(payload);
          setPaymentModalOpen(false);
        }}
      />
    </div>
  );
}