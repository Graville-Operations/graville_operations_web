'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { normaliseInvoice, Invoice } from '@/types/invoice';
import { ArrowLeft, Receipt, Loader2, Download } from 'lucide-react';

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
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; font-size: 13px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #33907c; }
            .company-name { font-size: 22px; font-weight: 800; color: #33907c; letter-spacing: -0.5px; }
            .company-sub  { font-size: 11px; color: #666; margin-top: 3px; }
            .invoice-tag  { text-align: right; }
            .invoice-tag h2 { font-size: 28px; font-weight: 800; color: #1a1a2e; letter-spacing: -1px; }
            .invoice-tag p  { font-size: 11px; color: #888; margin-top: 2px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }
            .meta-item label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #999; display: block; margin-bottom: 4px; }
            .meta-item p     { font-size: 13px; font-weight: 600; color: #1a1a2e; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            thead tr { background: #f0faf8; }
            th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #33907c; border-bottom: 2px solid #33907c; }
            td { padding: 11px 14px; font-size: 12px; color: #333; border-bottom: 1px solid #eee; }
            td.num { text-align: right; }
            th.num { text-align: right; }
            .totals { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .totals-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; color: #555; }
            .totals-row.total { font-size: 14px; font-weight: 700; color: #1a1a2e; border-top: 1px solid #eee; padding-top: 10px; margin-top: 6px; }
            .totals-row.balance { font-size: 13px; font-weight: 700; color: #33907c; }
            .notes { margin-top: 8px; padding: 16px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #33907c; }
            .notes label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #999; display: block; margin-bottom: 6px; }
            .notes p { font-size: 12px; color: #555; line-height: 1.6; }
            .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
            @page {
              size: A4;
              margin: 0.6in 0.5in 0.5in 0.5in;
              @top-left   { content: none; }
              @top-center { content: none; }
              @top-right  { content: none; }
              @bottom-left   { content: none; }
              @bottom-center { content: none; }
              @bottom-right  { content: none; }
            }
            @media print {
              html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company-name">Graville Enterprises</div>
              <div class="company-sub">Operations Management System · Supplier Invoice</div>
            </div>
            <div class="invoice-tag">
              <h2>INVOICE</h2>
              <p>#${invoice.invoice_number}</p>
            </div>
          </div>

          <div class="meta">
            <div class="meta-item">
              <label>Supplier</label>
              <p>${invoice.supplier_name ?? '—'}</p>
            </div>
            <div class="meta-item">
              <label>Invoice Date</label>
              <p>${invoice.invoice_date ?? '—'}</p>
            </div>
            <div class="meta-item">
              <label>Created On</label>
              <p>${invoice.created_at ?? '—'}</p>
            </div>
            <div class="meta-item">
              <label>LPO Number</label>
              <p>${invoice.lpo_number ?? '—'}</p>
            </div>
            <div class="meta-item">
              <label>Delivery No.</label>
              <p>${invoice.delivery_number ?? '—'}</p>
            </div>
            <div class="meta-item">
              <label>Requested By</label>
              <p>${invoice.submitted_by ?? '—'}</p>
            </div>
            <div class="meta-item">
              <label>Site</label>
              <p>${invoice.site ?? '—'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th class="num">Quantity</th>
                <th class="num">Unit Price</th>
                <th class="num">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items ?? []).map((item) => `
                <tr>
                  <td>${item.particular}</td>
                  <td class="num">${item.quantity}</td>
                  <td class="num">KES ${item.unit_price.toLocaleString()}</td>
                  <td class="num">KES ${item.total_price.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Total Amount</span>
              <span>KES ${invoice.total_amount.toLocaleString()}</span>
            </div>
            <div class="totals-row">
              <span>Amount Paid</span>
              <span>KES ${invoice.amount_paid.toLocaleString()}</span>
            </div>
            <div class="totals-row balance">
              <span>Balance Due</span>
              <span>KES ${(invoice.total_amount - invoice.amount_paid).toLocaleString()}</span>
            </div>
          </div>

          ${invoice.notes ? `
            <div class="notes">
              <label>Notes</label>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <span>Graville Enterprises Limited</span>
            <span>Generated ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px;';
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        iframe.contentWindow!.onafterprint = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        };
      };
      iframe.src = url;
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