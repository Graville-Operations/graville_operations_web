'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  CompanyInvoice,
  RawCompanyInvoice,
  normaliseCompanyInvoice,
} from '@/types/company_invoices';
import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';
import { Receipt, ArrowLeft, Loader2, Download } from 'lucide-react';

function Shimmer({ w, h }: { w: string; h: string }) {
  return (
    <div className="rounded animate-pulse" style={{ width: w, height: h, background: 'rgba(255,255,255,0.07)' }} />
  );
}

export default function CompanyInvoiceDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();

  const [invoice,       setInvoice]       = useState<CompanyInvoice | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloading,   setDownloading]   = useState(false);

  useEffect(() => {
    if (!id) return;

    // ── Prefill from list cache immediately ──
    const cached = sessionStorage.getItem(`cinv_${id}`);
    if (cached) {
      try {
        const partial = JSON.parse(cached);
        setInvoice({
          id:             Number(id),
          invoice_number: partial.invoice_number,
          invoiced_by:    partial.invoiced_by,
          invoice_date:   partial.invoice_date,
          total:          partial.total,
          source:         null,
          requester:      null,
          notes:          null,
          created_at:     null,
          updated_at:     null,
          items:          [],
        });
        setLoading(false);
      } catch (_) {}
    }

    // ── Fetch full details ──
    const load = async () => {
      try {
        setDetailLoading(true);
        const { data } = await api.get(`/company-invoices/details/${id}`);
        const raw = data?.data ?? data;
        setInvoice(normaliseCompanyInvoice(raw as RawCompanyInvoice));
        sessionStorage.removeItem(`cinv_${id}`);
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        // Keep cached/existing data — don't wipe on network failure
      } finally {
        setDetailLoading(false);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await generateInvoicePDF({
        invoiceNo:   invoice.invoice_number,
        invoiceType: 'Company',
        clientName:  invoice.invoiced_by ?? '—',
        invoiceDate: invoice.invoice_date ?? '—',
        createdBy:   invoice.invoiced_by  ?? '—',
        createdAt:   invoice.created_at   ?? '—',
        total:       invoice.total,
        notes:       invoice.notes ?? undefined,
        items: (invoice.items ?? []).map((item) => ({
          index:       item.index,
          particulars: item.particulars,
          quantity:    item.quantity,
          unitPrice:   item.unit_price,
          totalAmount: item.total_amount,
        })),
      });
    } finally {
      setDownloading(false);
    }
  };

  // ── Full skeleton — only when no cache at all ──
  if (loading && !invoice) return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="space-y-2"><Shimmer w="180px" h="20px" /><Shimmer w="120px" h="14px" /></div>
      </div>
      <div className="gv-card">
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2"><Shimmer w="60px" h="10px" /><Shimmer w="100px" h="14px" /></div>
          ))}
        </div>
      </div>
      <div className="gv-card !p-0 overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
          <Shimmer w="80px" h="10px" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
            <Shimmer w="20px" h="14px" /><Shimmer w="200px" h="14px" />
            <Shimmer w="40px" h="14px" /><Shimmer w="80px" h="14px" /><Shimmer w="80px" h="14px" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="gv-card h-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="gv-card h-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  );

  if (!invoice) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} />
      <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Invoice not found</p>
      <button onClick={() => router.back()} className="gv-btn-brand px-4 py-2 rounded-xl text-sm">Go Back</button>
    </div>
  );

  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl"
            style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
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
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907c' }}
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>

      {/* ── Meta card ── */}
      <div className="gv-card">
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {[
            { label: 'Invoice Date', value: invoice.invoice_date ?? '—',  shimmer: false },
            { label: 'Invoiced By',  value: invoice.invoiced_by  ?? '—',  shimmer: false },
            { label: 'Created On',   value: invoice.created_at   ?? null, shimmer: detailLoading && !invoice.created_at },
          ].map(({ label, value, shimmer }) => (
            <div key={label}>
              <p className="gv-eyebrow mb-0.5 text-[10px]">{label}</p>
              {shimmer
                ? <Shimmer w="100px" h="14px" />
                : <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value ?? '—'}</p>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── Line items ── */}
      {detailLoading && invoice.items.length === 0 ? (
        <div className="gv-card !p-0 overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="gv-eyebrow text-[10px]">Line Items</p>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-6 px-5 py-4" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
              <Shimmer w="20px" h="13px" />
              <Shimmer w="200px" h="13px" />
              <Shimmer w="40px" h="13px" />
              <Shimmer w="80px" h="13px" />
              <Shimmer w="80px" h="13px" />
            </div>
          ))}
        </div>
      ) : invoice.items && invoice.items.length > 0 ? (
        <div className="gv-card !p-0 overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="gv-eyebrow text-[10px]">Line Items</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                {['', 'Particulars', 'Quantity', 'Unit Price', 'Total'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
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
      ) : null}

      {/* ── Total + Notes ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="gv-card flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
          <span className="text-2xl font-bold" style={{ color: '#33907c' }}>KES {invoice.total.toLocaleString()}</span>
        </div>
        <div className="gv-card">
          <p className="gv-eyebrow text-[10px] mb-1">Notes</p>
          {detailLoading && !invoice.notes
            ? <Shimmer w="200px" h="13px" />
            : <p className="text-sm leading-relaxed" style={{ color: invoice.notes ? 'var(--gv-text-muted)' : 'var(--gv-text-faint)' }}>
                {invoice.notes ?? 'No notes'}
              </p>
          }
        </div>
      </div>
    </div>
  );
}