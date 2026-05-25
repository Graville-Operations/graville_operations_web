'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Eye, Plus, X, Receipt } from 'lucide-react';
import CreateSubcontractorModal from './components/page';


interface SubcontractorInvoiceItem {
  id:          number;
  index:       number;
  description: string;
  quantity:    number;
  unit_price:  number;
  total_price: number;
}

interface SubcontractorInvoice {
  id:                  number;
  invoice_number:      string;
  lpo_number:          string | null;
  subcontractor_name:  string;
  work_description:    string | null;
  invoice_date:        string;
  total_amount:        number;
  amount_paid:         number;
  status:              string;
  site:                string | null;
  submitted_by:        string | null;
  notes:               string | null;
  created_at:          string;
  items:               SubcontractorInvoiceItem[];
}


const statusStyles: Record<string, { bg: string; color: string }> = {
  PENDING:        { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:       { bg: 'rgba(96,165,250,0.15)',   color: '#60a5fa' },
  REJECTED:       { bg: 'rgba(248,113,113,0.15)',  color: '#f87171' },
  PARTIALLY_PAID: { bg: 'rgba(251,146,60,0.15)',   color: '#fb923c' },
  FULLY_PAID:     { bg: 'rgba(51,144,124,0.15)',   color: '#33907c' },
};


export default function SubcontractorInvoicesPage() {
  const [invoices, setInvoices]     = useState<SubcontractorInvoice[]>([]);
  const [filtered, setFiltered]     = useState<SubcontractorInvoice[]>([]);
  const [search, setSearch]         = useState('');
  const [isLoading, setIsLoading]   = useState(true);
  const [selected, setSelected]     = useState<SubcontractorInvoice | null>(null);
  const [showCreate, setShowCreate] = useState(false);


  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      invoices.filter((i) =>
        i.invoice_number.toLowerCase().includes(q)     ||
        i.subcontractor_name.toLowerCase().includes(q) ||
        (i.submitted_by ?? '').toLowerCase().includes(q) ||
        (i.site ?? '').toLowerCase().includes(q)       ||
        (i.work_description ?? '').toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
      )
    );
  }, [search, invoices]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/invoices/subcontractor/all');
      console.log('RAW SUBCONTRACTOR RESPONSE:', JSON.stringify(data, null, 2));
      const items = data?.data?.items ?? [];
      setInvoices(items);
      setFiltered(items);
    } catch (err) {
      console.error('Failed to fetch subcontractor invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            Sub-Contractor Invoices
          </h2>
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
            placeholder="Search by invoice no, sub-contractor, site, work, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input !pl-9 !py-2 text-sm"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="gv-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
            <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
              {search ? `No results for "${search}"` : 'No sub-contractor invoices found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Invoice No', 'Sub-Contractor', 'Work Description', 'Site', 'Amount', 'Paid', 'Status', ''].map((h) => (
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
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.subcontractor_name}</td>
                      <td className="px-4 py-3 text-sm max-w-[180px] truncate" style={{ color: 'var(--gv-text-muted)' }}>
                        {inv.work_description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.site ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>KES {inv.total_amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>KES {inv.amount_paid.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                          {inv.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(inv)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#33907c' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(51,144,124,0.12)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <CreateSubcontractorModal
          onClose={() => setShowCreate(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
              <div className="flex items-center gap-3">
                <div className="gv-icon-box"><Receipt size={18} className="text-[#33907c]" /></div>
                <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>
                  Invoice #{selected.invoice_number}
                </h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Sub-Contractor',    value: selected.subcontractor_name },
                  { label: 'LPO Number',         value: selected.lpo_number      ?? '—' },
                  { label: 'Work Description',   value: selected.work_description ?? '—' },
                  { label: 'Invoice Date',       value: new Date(selected.invoice_date).toLocaleDateString() },
                  { label: 'Site',               value: selected.site             ?? '—' },
                  { label: 'Submitted By',       value: selected.submitted_by     ?? '—' },
                  { label: 'Submitted On',       value: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—' },
                  { label: 'Status',             value: selected.status.replace(/_/g, ' ') },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="gv-eyebrow mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Items table */}
              {selected.items && selected.items.length > 0 && (
                <div>
                  <p className="gv-eyebrow mb-3">Items</p>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gv-glass-border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                          {['Description', 'Qty', 'Unit Price', 'Total'].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((item, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                            <td className="px-4 py-2.5" style={{ color: 'var(--gv-text-primary)' }}>{item.description}</td>
                            <td className="px-4 py-2.5" style={{ color: 'var(--gv-text-muted)' }}>{item.quantity}</td>
                            <td className="px-4 py-2.5" style={{ color: 'var(--gv-text-muted)' }}>KES {item.unit_price.toLocaleString()}</td>
                            <td className="px-4 py-2.5 font-semibold" style={{ color: '#33907c' }}>KES {item.total_price.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
                {[
                  { label: 'Total Amount', value: `KES ${selected.total_amount.toLocaleString()}`, color: 'var(--gv-text-primary)' },
                  { label: 'Amount Paid',  value: `KES ${selected.amount_paid.toLocaleString()}`,  color: '#33907c' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--gv-text-muted)' }}>{label}</span>
                    <span className="font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                  <span style={{ color: 'var(--gv-text-muted)' }}>Balance</span>
                  <span className="font-bold" style={{ color: '#f87171' }}>
                    KES {(selected.total_amount - selected.amount_paid).toLocaleString()}
                  </span>
                </div>
              </div>

              {selected.notes && (
                <div>
                  <p className="gv-eyebrow mb-1">Notes</p>
                  <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}