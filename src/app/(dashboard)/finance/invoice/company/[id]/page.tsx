'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  CompanyInvoice,
  RawCompanyInvoice,
  normaliseCompanyInvoice,
} from '@/types/company_invoices';
import { Receipt, ArrowLeft, Loader2 } from 'lucide-react';

export default function CompanyInvoiceDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [invoice, setInvoice] = useState<CompanyInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/company-invoices/details/${id}`);
        const raw = data?.data ?? data;
        setInvoice(normaliseCompanyInvoice(raw as RawCompanyInvoice));
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin" style={{ color: '#33907c' }} />
    </div>
  );

  if (error || !invoice) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} />
      <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Invoice not found</p>
      <button onClick={() => router.back()} className="gv-btn-brand px-4 py-2 rounded-xl text-sm">
        Go Back
      </button>
    </div>
  );

  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl"
          style={{
            background: 'var(--gv-glass-bg)',
            border: '1px solid var(--gv-glass-border)',
            color: 'var(--gv-text-muted)',
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            Invoice {invoice.invoice_number}
          </h2>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {invoice.invoiced_by ?? 'Company Invoice'}
          </p>
        </div>
      </div>

      {/* ── Meta card ── */}
      <div className="gv-card">
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {[
            { label: 'Invoice Date', value: invoice.invoice_date ?? '—' },
            { label: 'Invoiced By',  value: invoice.invoiced_by  ?? '—' },
            { label: 'Created On',   value: invoice.created_at   ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="gv-eyebrow mb-0.5 text-[10px]">{label}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Line items ── */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="gv-card !p-0 overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="gv-eyebrow text-[10px]">Line Items</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                {['', 'Particulars', 'Quantity', 'Unit Price', 'Total'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#33907c' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{item.index}</td>
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{item.particulars}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gv-text-muted)' }}>KES {item.unit_price.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: '#33907c' }}>KES {item.total_amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Total + Notes ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="gv-card flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
          <span className="text-2xl font-bold" style={{ color: '#33907c' }}>KES {invoice.total.toLocaleString()}</span>
        </div>

        <div className="gv-card">
          <p className="gv-eyebrow text-[10px] mb-1">Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: invoice.notes ? 'var(--gv-text-muted)' : 'var(--gv-text-faint)' }}>
            {invoice.notes ?? 'No notes'}
          </p>
        </div>
      </div>

    </div>
  );
}