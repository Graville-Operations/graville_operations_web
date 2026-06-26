'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Receipt, Download } from 'lucide-react';
import InvoiceDetailSkeleton from '@/components/shared/InvoiceDetailSkeleton';
import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';

interface InvoiceItem {
  id:          number;
  index:       number;
  particulars: string;
  quantity:    number;
  unitPrice:   number;
  totalAmount: number;
}

interface InvoiceDetail {
  id:          number;
  invoiceNo:   string;
  clientName:  string;
  invoiceDate: string;
  notes?:      string;
  createdBy:   { id: number; name: string };
  total:       number;
  created_at:  string;
  items:       InvoiceItem[];
}

const TIMEOUT_MS = 10_000;
const RETRY_DELAY_S = 3;

export default function ClientInvoiceDetailPage() {
  const router = useRouter();

  const [id, setId]          = useState<string | null>(null);
  const [invoice,  setInvoice]     = useState<InvoiceDetail | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError]  = useState<string | null>(null);
  const [retryIn, setRetryIn]  = useState<number | null>(null);
  const [preview, setPreview] = useState<{ invoiceNo?: string; clientName?: string }>({});

  const resolvedRef  = useRef(false);
  const cancelledRef = useRef(false);
  const timeoutRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const tickRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current);  timeoutRef.current = null; }
    if (tickRef.current)    { clearInterval(tickRef.current);    tickRef.current    = null; }
  }, []);
  useEffect(() => {
    const segments  = window.location.pathname.split('/');
    const invoiceId = segments[segments.length - 1];
    if (invoiceId && !isNaN(Number(invoiceId))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setId(invoiceId);
      try {
        const raw = sessionStorage.getItem(`invoice-preview-${invoiceId}`);
        if (raw) setPreview(JSON.parse(raw));
      } catch { /* ignore */ }
    } else {
      setError('Invalid invoice ID in URL');
      setIsLoading(false);
    }
  }, []);

  const load = useCallback(async (invoiceId: string) => {
    clearTimers();
    cancelledRef.current = false;
    resolvedRef.current  = false;

    setIsLoading(true);
    setError(null);
    setRetryIn(null);

    timeoutRef.current = setTimeout(() => {
      if (resolvedRef.current || cancelledRef.current) return;
      let countdown = RETRY_DELAY_S;

      tickRef.current = setInterval(() => {
        if (resolvedRef.current || cancelledRef.current) {
          clearTimers();
          setRetryIn(null);
          return;
        }
        countdown -= 1;
        if (countdown <= 0) {
          clearTimers();
          setRetryIn(null);
          // eslint-disable-next-line react-hooks/immutability
          load(invoiceId);
        }
        // No setRetryIn call — countdown is invisible to the user
      }, 1000);
    }, TIMEOUT_MS);

    try {
      const { data } = await api.get(`/client-invoices/details/${invoiceId}`);

      resolvedRef.current = true;
      clearTimers();

      if (cancelledRef.current) return;

      const raw = data;
      setInvoice(
        raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
          ? raw.data
          : raw,
      );
      setRetryIn(null);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      resolvedRef.current = true;
      clearTimers();
      if (cancelledRef.current) return;
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load invoice');
      setRetryIn(null);
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [clearTimers]);

  useEffect(() => {
    if (!id) return;
    load(id);
    return () => {
      cancelledRef.current = true;
      resolvedRef.current  = true;
      clearTimers();
    };
  }, [id, load, clearTimers]);

  const handleDownload = async () => {
    if (!invoice) return;
    setIsExporting(true);
    try {
      await generateInvoicePDF({
        invoiceNo:   invoice.invoiceNo,
        invoiceType: 'Client',
        clientName:  invoice.clientName,
        invoiceDate: invoice.invoiceDate,
        notes:       invoice.notes,
        createdBy:   invoice.createdBy?.name ?? '—',
        createdAt:   invoice.created_at,
        total:       invoice.total,
        items:       invoice.items.map((item) => ({
          index:       item.index,
          particulars: item.particulars,
          quantity:    item.quantity,
          unitPrice:   item.unitPrice,
          totalAmount: item.totalAmount,
        })),
      });
    } catch (err) {
      console.error('[PDF export]', err);
    } finally {
      setIsExporting(false);
    }
  };
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

      {/* Header */}
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

      {/* Meta card */}
      <div className="gv-card grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="gv-eyebrow mb-1">Invoice No.</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{invoice.invoiceNo}</p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Client</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{invoice.clientName}</p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Invoice Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{invoice.invoiceDate ?? '—'}</p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Total (KES)</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>{invoice.total?.toLocaleString() ?? '—'}</p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Created By</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{invoice.createdBy?.name ?? '—'}</p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Created At</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{invoice.created_at ?? '—'}</p>
        </div>
        {invoice.notes && (
          <div className="col-span-2 md:col-span-4">
            <p className="gv-eyebrow mb-1">Notes</p>
            <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Line items */}
      <div className="gv-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>Line Items</h3>
        </div>
        <table className="w-full">
          <thead style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--gv-glass-border)' }}>
            <tr>
              {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--gv-text-subtle)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(invoice.items ?? []).map((item, i) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-white/5"
                style={{ borderTop: i > 0 ? '1px solid var(--gv-glass-border)' : undefined }}
              >
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{item.index}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-primary)' }}>{item.particulars}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{item.unitPrice?.toLocaleString() ?? '—'}</td>
                <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>{item.totalAmount?.toLocaleString() ?? '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid var(--gv-glass-border)' }}>
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--gv-text-muted)' }}>
                Grand Total
              </td>
              <td className="px-6 py-4 text-sm font-bold" style={{ color: 'var(--gv-brand)' }}>
                {invoice.total?.toLocaleString() ?? '—'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}