'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Download } from 'lucide-react';
import InvoiceDetailSkeleton from '@/components/shared/InvoiceDetailSkeleton';
import { useClientInvoiceDetail } from '@/hooks/client-invoices/useClientInvoiceDetail';
import { InvoiceMetaCard } from '@/components/finance/client-invoices/InvoiceMetaCard';
import { InvoiceLineItemsTable } from '@/components/finance/client-invoices/InvoiceLineItemsTable';

export default function ClientInvoiceDetailPage() {
  const router = useRouter();
  const { id, invoice, isLoading, isExporting, error, retryIn, preview, load, handleDownload } = useClientInvoiceDetail();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
              Invoice {invoice.invoiceNo}
            </h2>
            <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
              Client: {invoice.clientName}
            </p>
          </div>
        </div>

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

      <InvoiceMetaCard invoice={invoice} />
      <InvoiceLineItemsTable invoice={invoice} />
    </div>
  );
}