'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Invoice, RawInvoice, RawPaginatedResponse, normaliseInvoice } from '@/types';
import { Search, Eye, Plus, X, Receipt, Loader2 } from 'lucide-react';
import CreateInvoiceModal from './components/page';

const statusStyles: Record<string, { bg: string; color: string }> = {
  PENDING:        { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:       { bg: 'rgba(96,165,250,0.15)',   color: '#60a5fa' },
  REJECTED:       { bg: 'rgba(248,113,113,0.15)',  color: '#f87171' },
  PARTIALLY_PAID: { bg: 'rgba(251,146,60,0.15)',   color: '#fb923c' },
  FULLY_PAID:     { bg: 'rgba(51,144,124,0.15)',   color: '#33907c' },
};

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices]        = useState<Invoice[]>([]);
  const [filtered, setFiltered]        = useState<Invoice[]>([]);
  const [search, setSearch]            = useState('');
  const [isLoading, setIsLoading]      = useState(true);
  const [selected, setSelected]        = useState<Invoice | null>(null);
  const [detailLoading, setDetailLoad] = useState(false);
  const [showCreate, setShowCreate]    = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      invoices.filter((i) =>
        i.invoice_number.toLowerCase().includes(q) ||
        i.supplier_name.toLowerCase().includes(q)  ||
        (i.submitted_by ?? '').toLowerCase().includes(q) ||
        (i.site ?? '').toLowerCase().includes(q)   ||
        i.status.toLowerCase().includes(q)
      )
    );
  }, [search, invoices]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/invoices/all');
      const res      = data as RawPaginatedResponse<RawInvoice>;
      const raw      = res?.data?.items ?? [];
      const normalised = raw.map(normaliseInvoice);
      setInvoices(normalised);
      setFiltered(normalised);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = async (inv: Invoice) => {
    setSelected(inv);
    setDetailLoad(true);
    try {
      const { data } = await api.get(`/invoices/details/${inv.id}`);
      const full = normaliseInvoice(data?.data ?? data);
      setSelected(full);
    } catch (err) {
      console.error('Failed to fetch invoice detail:', err);
    } finally {
      setDetailLoad(false);
    }
  };

  const balance = selected ? selected.total_amount - selected.amount_paid : 0;

  const Spinner = () => (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48">
      <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
      <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
        {search ? `No results for "${search}"` : 'No invoices found'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>Supplier Invoices</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* ── Search ── */}
      <div className="gv-card !p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gv-text-subtle)' }} />
          <input
            type="text"
            placeholder="Search by invoice no, supplier, site, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input !pl-9 !py-2 text-sm"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP — table
      ══════════════════════════════════════════════════════ */}
      <div className="gv-card !p-0 overflow-hidden hidden md:block">
        {isLoading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Invoice No', 'Supplier', 'Site', 'Submitted By', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => {
                  const st = statusStyles[inv.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => openDetail(inv)}
                      className="cursor-pointer"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.supplier_name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.site ?? '—'}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.submitted_by ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>KES {inv.total_amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                          {inv.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE — tap cards
      ══════════════════════════════════════════════════════ */}
      <div className="space-y-2 md:hidden">
        {isLoading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          filtered.map((inv) => {
            const st = statusStyles[inv.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };
            return (
              <div
                key={inv.id}
                onClick={() => openDetail(inv)}
                className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
                style={{ padding: '14px 16px' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--gv-text-primary)' }}>
                    #{inv.invoice_number}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                    {inv.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--gv-text-muted)' }}>{inv.supplier_name}</p>
                <div className="flex items-center gap-3 mb-2.5">
                  {inv.site && (
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(51,144,124,0.1)', color: '#33907c' }}>
                      {inv.site}
                    </span>
                  )}
                  {inv.submitted_by && (
                    <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>by {inv.submitted_by}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                    KES {inv.total_amount.toLocaleString()}
                  </span>
                  <Eye size={14} style={{ color: 'var(--gv-text-subtle)' }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Create Invoice Modal ── */}
      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          Invoice Detail — bottom sheet on mobile, modal on desktop
      ══════════════════════════════════════════════════════ */}
      {selected && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div
            className="w-full md:max-w-xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
            style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="gv-icon-box !p-1.5"><Receipt size={15} className="text-[#33907c]" /></div>
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ color: 'var(--gv-text-primary)' }}>
                    Invoice #{selected.invoice_number}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>{selected.supplier_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const st = statusStyles[selected.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };
                  return (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {selected.status.replace(/_/g, ' ')}
                    </span>
                  );
                })()}
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-2.5 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="h-3.5 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 py-4" style={{ color: 'var(--gv-text-muted)' }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Loading full details…</span>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: 'Invoice Date',  value: new Date(selected.invoice_date).toLocaleDateString() },
                    { label: 'LPO Number',    value: selected.lpo_number      ?? '—' },
                    { label: 'Delivery No.',  value: selected.delivery_number  ?? '—' },
                    { label: 'Site',          value: selected.site             ?? '—' },
                    { label: 'Submitted By',  value: selected.submitted_by     ?? '—' },
                    { label: 'Submitted On',  value: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="gv-eyebrow mb-0.5 text-[10px]">{label}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {selected.items && selected.items.length > 0 && (
                  <div>
                    <p className="gv-eyebrow text-[10px] mb-2">Line Items</p>
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gv-glass-border)' }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                            {['Particulars', 'Qty', 'Unit Price', 'Total'].map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: '#33907c', fontSize: '10px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.items.map((item, i) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                              <td className="px-3 py-2" style={{ color: 'var(--gv-text-primary)' }}>{item.particular}</td>
                              <td className="px-3 py-2" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                              <td className="px-3 py-2" style={{ color: 'var(--gv-text-muted)' }}>{item.unit_price.toLocaleString()}</td>
                              <td className="px-3 py-2 font-semibold" style={{ color: '#33907c' }}>{item.total_price.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
                    <span className="font-bold" style={{ color: 'var(--gv-text-primary)' }}>KES {selected.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--gv-text-muted)' }}>Amount Paid</span>
                    <span className="font-bold" style={{ color: '#33907c' }}>KES {selected.amount_paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                    <span style={{ color: 'var(--gv-text-muted)' }}>Balance Due</span>
                    <span className="font-bold" style={{ color: balance > 0 ? '#f87171' : '#33907c' }}>
                      KES {balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <p className="gv-eyebrow text-[10px] mb-1">Notes</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--gv-text-muted)' }}>{selected.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}