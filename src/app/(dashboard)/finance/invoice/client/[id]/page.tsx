'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Receipt } from 'lucide-react';

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
  const [id, setId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const invoiceId = segments[segments.length - 1];
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
          setError('Request timed out. Check your network');
          setIsLoading(false);
        }
      }, 10000);

      try {
        const response = await api.get(`/client-invoices/details/${id}`);
        clearTimeout(timeout);
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
        setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load invoice');
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    };

    loadInvoice();
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--gv-brand)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--gv-text-faint)' }}>
        <Receipt size={48} className="opacity-30" />
        <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        <button onClick={() => router.back()} className="text-xs hover:underline" style={{ color: 'var(--gv-brand)' }}>
          Go back
        </button>
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

      {/* Meta card */}
      <div className="gv-card grid grid-cols-2 md:grid-cols-4 gap-6">

        {/* Row 1: core fields */}
        <div>
          <p className="gv-eyebrow mb-1">Invoice No.</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
            {invoice.invoiceNo}
          </p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Client</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
            {invoice.clientName}
          </p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Invoice Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
            {invoice.invoiceDate ?? '—'}
          </p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Total (KES)</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>
            {invoice.total?.toLocaleString() ?? '—'}
          </p>
        </div>

        {/* Row 2: created by + created at */}
        <div>
          <p className="gv-eyebrow mb-1">Created By</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {invoice.createdBy?.name ?? '—'}
          </p>
        </div>
        <div>
          <p className="gv-eyebrow mb-1">Created At</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {invoice.created_at ?? '—'}
          </p>
        </div>

        {/* Row 3: notes — full width, only if present */}
        {invoice.notes && (
          <div className="col-span-2 md:col-span-4">
            <p className="gv-eyebrow mb-1">Notes</p>
            <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {/* Line items */}
      <div className="gv-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
            Line Items
          </h3>
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
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
                  {item.index}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-primary)' }}>
                  {item.particulars}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                  {item.unitPrice?.toLocaleString() ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>
                  {item.totalAmount?.toLocaleString() ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid var(--gv-glass-border)' }}>
            <tr>
              <td
                colSpan={4}
                className="px-6 py-4 text-sm font-semibold text-right"
                style={{ color: 'var(--gv-text-muted)' }}
              >
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