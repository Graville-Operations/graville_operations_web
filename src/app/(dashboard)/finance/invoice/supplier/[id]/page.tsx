'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { normaliseInvoice, Invoice } from '@/types/invoice';
import { ArrowLeft, Receipt, Loader2 } from 'lucide-react';

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

  const [invoice, setInvoice]     = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Read site + date stashed by the list page
    const siteFromList = sessionStorage.getItem(`invoice_${id}_site`) ?? null;
    const dateFromList = sessionStorage.getItem(`invoice_${id}_date`) ?? null;

    api.get(`/invoices/details/${id}`)
      .then(({ data }) => {
        const full = normaliseInvoice(data?.data ?? data);
        setInvoice({
          ...full,
          site:         full.site         ?? siteFromList,
          invoice_date: full.invoice_date ?? dateFromList,
        });
      })
      .catch((err) => console.error('Failed to load invoice:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const balance = invoice ? invoice.total_amount - invoice.amount_paid : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gv-brand)' }} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p style={{ color: 'var(--gv-text-muted)' }}>Invoice not found.</p>
        <button onClick={() => router.back()} className="gv-btn-outline text-sm px-4 py-2">Go back</button>
      </div>
    );
  }

  const st = statusStyles[invoice.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Back + header */}
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
        <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>
          {invoice.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Meta grid */}
      <div className="gv-card">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            { label: 'Invoice Date',  value: invoice.invoice_date  ?? '—' },
            { label: 'Created On',    value: invoice.created_at    ?? '—' },
            { label: 'LPO Number',   value: invoice.lpo_number     ?? '—' },
            { label: 'Delivery No.', value: invoice.delivery_number ?? '—' },
            { label: 'Requested By', value: invoice.submitted_by   ?? '—' },
            { label: 'Site',         value: invoice.site           ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="gv-eyebrow mb-1">{label}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Line items */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="gv-card !p-0 overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="gv-eyebrow">Line Items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                  {['Material', 'Quantity', 'Unit Price', 'Total'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gv-brand)' }}>{h}</th>
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
      )}

      {/* Totals */}
      <div className="gv-card space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
          <span className="font-bold" style={{ color: 'var(--gv-text-primary)' }}>KES {invoice.total_amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--gv-text-muted)' }}>Amount Paid</span>
          <span className="font-bold" style={{ color: 'var(--gv-brand)' }}>KES {invoice.amount_paid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          <span style={{ color: 'var(--gv-text-muted)' }}>Balance Due</span>
          <span className="font-bold" style={{ color: balance > 0 ? 'var(--destructive)' : 'var(--gv-brand)' }}>
            KES {balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="gv-card" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <p className="gv-eyebrow mb-2">Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--gv-text-muted)' }}>{invoice.notes}</p>
        </div>
      )}

    </div>
  );
}