'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { normaliseInvoice, Invoice } from '@/types/invoice';
import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';
import { ArrowLeft, Loader2, Download } from 'lucide-react';

const statusStyles: Record<string, { bg: string; color: string }> = {
  PENDING:        { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:       { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  REJECTED:       { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  PARTIALLY_PAID: { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  FULLY_PAID:     { bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
};

export default function InvoiceDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [invoice,     setInvoice]     = useState<Invoice | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const raw = sessionStorage.getItem(`invoice_${id}_preview`);
    if (raw) {
      try {
        const preview = JSON.parse(raw) as Invoice;
        setInvoice(preview);
        setIsLoading(false);
        setIsEnriching(true);
      } catch { /* ignore bad JSON */ }
    }

    api.get(`/invoices/details/${id}`)
      .then(({ data }) => {
        const full = normaliseInvoice(data?.data ?? data);
        setInvoice((prev) => ({
          ...prev,
          ...full,
          site:         full.site         ?? prev?.site         ?? null,
          invoice_date: full.invoice_date ?? prev?.invoice_date ?? null,
          submitted_by: full.submitted_by ?? prev?.submitted_by ?? null,
        }));
      })
      .catch((err) => console.error('Failed to load invoice:', err))
      .finally(() => {
        setIsLoading(false);
        setIsEnriching(false);
      });
  }, [id]);

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await generateInvoicePDF({
        invoiceNo:   invoice.invoice_number,
        invoiceType: 'Supplier',
        clientName:  invoice.supplier_name ?? '—',
        invoiceDate: invoice.invoice_date  ?? '—',
        createdBy:   invoice.submitted_by  ?? '—',
        createdAt:   invoice.created_at    ?? '—',
        total:       invoice.total_amount,
        notes:       invoice.notes ?? undefined,
        items: (invoice.items ?? []).map((item, i) => ({
          index:       i + 1,
          particulars: item.particular,
          quantity:    item.quantity,
          unitPrice:   item.unit_price,
          totalAmount: item.total_price,
        })),
      });
    } finally {
      setDownloading(false);
    }
  };

  const balance = invoice ? invoice.total_amount - invoice.amount_paid : 0;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gv-brand)' }} />
    </div>
  );

  if (!invoice) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p style={{ color: 'var(--gv-text-muted)' }}>Invoice not found.</p>
      <button onClick={() => router.back()} className="gv-btn-outline text-sm px-4 py-2">Go back</button>
    </div>
  );

  const st = statusStyles[invoice.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate" style={{ color: 'var(--gv-text-primary)' }}>
            Invoice {invoice.invoice_number}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>{invoice.supplier_name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEnriching && (
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gv-brand)' }} />
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: st.bg, color: st.color }}>
            {invoice.status.replace(/_/g, ' ')}
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907c' }}
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── Meta grid ── */}
      <div className="gv-card">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            { label: 'Invoice Date',  value: invoice.invoice_date   ?? '—' },
            { label: 'Created On',    value: invoice.created_at     ?? '—' },
            { label: 'LPO Number',    value: invoice.lpo_number     ?? '—' },
            { label: 'Delivery No.', value: invoice.delivery_number ?? '—' },
            { label: 'Requested By', value: invoice.submitted_by    ?? '—' },
            { label: 'Site',         value: invoice.site            ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="gv-eyebrow mb-1">{label}</p>
              {value === '—' && isEnriching ? (
                <div className="h-3.5 w-24 rounded animate-pulse mt-1"
                  style={{ background: 'rgba(255,255,255,0.07)' }} />
              ) : (
                <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Line items ── */}
      {invoice.items && invoice.items.length > 0 ? (
        <div className="gv-card !p-0 overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="gv-eyebrow">Line Items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                  {['Material', 'Quantity', 'Unit Price', 'Total'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--gv-brand)' }}>{h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--gv-text-primary)' }}>{item.particular}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--gv-text-muted)' }}>KES {item.unit_price.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--gv-brand)' }}>KES {item.total_price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : isEnriching ? (
        <div className="gv-card !p-0 overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="gv-eyebrow">Line Items</p>
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-3 rounded animate-pulse flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-3 rounded animate-pulse w-16" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-3 rounded animate-pulse w-20" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-3 rounded animate-pulse w-20" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Totals ── */}
      <div className="gv-card space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
          <span className="font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            KES {invoice.total_amount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--gv-text-muted)' }}>Amount Paid</span>
          <span className="font-bold" style={{ color: 'var(--gv-brand)' }}>
            KES {invoice.amount_paid.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-3"
          style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          <span style={{ color: 'var(--gv-text-muted)' }}>Balance Due</span>
          <span className="font-bold" style={{ color: balance > 0 ? 'var(--destructive)' : 'var(--gv-brand)' }}>
            KES {balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Notes ── */}
      {invoice.notes ? (
        <div className="gv-card">
          <p className="gv-eyebrow mb-2">Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--gv-text-muted)' }}>{invoice.notes}</p>
        </div>
      ) : isEnriching ? (
        <div className="gv-card">
          <p className="gv-eyebrow mb-2">Notes</p>
          <div className="space-y-2">
            <div className="h-3 rounded animate-pulse w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-3 rounded animate-pulse w-3/4" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        </div>
      ) : null}

    </div>
  );
}