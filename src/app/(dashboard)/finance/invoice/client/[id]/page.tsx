'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Receipt } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface InvoiceItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface InvoiceDetail {
  id: number;
  invoiceNo: string;
  clientName: string;
  invoiceDate: string;
  notes?: string;
  createdBy: { id: number; name: string };
  total: number;
  created_at: string;
  items: InvoiceItem[];
}

export default function ClientInvoiceDetailPage() {
  const router = useRouter();

  // Read the segment name directly from the URL instead of useParams
  // This is the most reliable method in Next.js 13/14 app router
  const [id, setId] = useState<string | null>(null);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract id from the URL directly — bypasses useParams hydration timing issues
  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const invoiceId = segments[segments.length - 1];
    console.log('[InvoiceDetail] Extracted id from URL:', invoiceId);
    if (invoiceId && !isNaN(Number(invoiceId))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setId(invoiceId);
    } else {
      setError('Invalid invoice ID in URL');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadInvoice = async () => {
      setIsLoading(true);
      setError(null);

      const timeout = setTimeout(() => {
        if (!cancelled) {
          cancelled = true;
          setError('Request timed out. Check your network or API.');
          setIsLoading(false);
        }
      }, 10000);

      try {
        console.log('[InvoiceDetail] Fetching invoice id:', id);
        const response = await api.get(`/client-invoices/details/${id}`);
        clearTimeout(timeout);
        console.log('[InvoiceDetail] Raw response:', JSON.stringify(response.data, null, 2));

        if (cancelled) return;

        const raw = response.data;
        const detail: InvoiceDetail =
          raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
            ? raw.data
            : raw;

        setInvoice(detail);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        clearTimeout(timeout);
        if (cancelled) return;
        console.error('[InvoiceDetail] Error:', err?.response?.data ?? err?.message);
        setError(
          err?.response?.data?.detail ?? err?.message ?? 'Failed to load invoice'
        );
        
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    };

    loadInvoice();
    return () => { cancelled = true; };
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/40 gap-3">
        <Receipt size={48} className="opacity-30" />
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-[#33907C] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/40 gap-3">
        <Receipt size={48} className="opacity-30" />
        <p className="text-sm">Invoice not found</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-[#33907C] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Invoice {invoice.invoiceNo}</h2>
          <p className="text-sm text-blue-200/60">Client: {invoice.clientName}</p>
        </div>
      </div>

      {/* Meta card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Invoice No.</p>
          <p className="text-sm font-semibold text-white">{invoice.invoiceNo}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Client</p>
          <p className="text-sm font-semibold text-white">{invoice.clientName}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Invoice Date</p>
          <p className="text-sm font-semibold text-white">
  {invoice.invoiceDate ?? '—'}
</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total (KES)</p>
          <p className="text-sm font-semibold text-[#33907C]">
            {invoice.total?.toLocaleString() ?? '—'}
          </p>
        </div>

        {invoice.notes && (
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-white/70">{invoice.notes}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Created By</p>
          <p className="text-sm text-white/70">{invoice.createdBy?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Created At</p>
          <p className="text-sm text-white/70">
  {invoice.created_at ?? '—'}
</p>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Line Items</h3>
        </div>
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {(invoice.items ?? []).map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-white/40">{item.index}</td>
                <td className="px-6 py-4 text-sm text-white">{item.particulars}</td>
                <td className="px-6 py-4 text-sm text-white/60">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-white/60">
                  {item.unitPrice?.toLocaleString() ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-[#33907C]">
                  {item.totalAmount?.toLocaleString() ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-white/5 border-t border-white/10">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-white/60 text-right">
                Grand Total
              </td>
              <td className="px-6 py-4 text-sm font-bold text-[#33907C]">
                {invoice.total?.toLocaleString() ?? '—'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}