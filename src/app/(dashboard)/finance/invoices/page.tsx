'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Invoice, RawInvoice, RawPaginatedResponse, normaliseInvoice } from '@/types';
import { Search, Eye, Plus, X, Receipt, Trash2, Layers, Tag } from 'lucide-react';

// ── Status styles ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; color: string }> = {
  PENDING:        { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:       { bg: 'rgba(96,165,250,0.15)',   color: '#60a5fa' },
  REJECTED:       { bg: 'rgba(248,113,113,0.15)',  color: '#f87171' },
  PARTIALLY_PAID: { bg: 'rgba(251,146,60,0.15)',   color: '#fb923c' },
  FULLY_PAID:     { bg: 'rgba(51,144,124,0.15)',   color: '#33907c' },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface ItemForm {
  particulars: string;
  quantity:    string;
  unit_price:  string;
}

const emptyItem = (): ItemForm => ({ particulars: '', quantity: '', unit_price: '' });

const emptyForm = () => ({
  invoice_number: '',
  lpo_number:     '',
  invoice_date:   '',
  supplier_name:  '',
  notes:          '',
});

// ── Material Detail Modal ─────────────────────────────────────────────────────

interface MaterialDetailModalProps {
  item: ItemForm;
  idx:  number;
  onClose: () => void;
}

function MaterialDetailModal({ item, idx, onClose }: MaterialDetailModalProps) {
  const qty       = parseFloat(item.quantity)   || 0;
  const unitP     = parseFloat(item.unit_price) || 0;
  const lineTotal = qty * unitP;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: '#0a1120',
          border:     '1px solid rgba(51,144,124,0.35)',
          boxShadow:  '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background:   'linear-gradient(135deg, rgba(51,144,124,0.2) 0%, rgba(51,144,124,0.05) 100%)',
            borderBottom: '1px solid rgba(51,144,124,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'rgba(51,144,124,0.3)', color: '#33907c' }}
            >
              {idx + 1}
            </div>
            <div>
              <p className="font-bold text-sm truncate max-w-[180px]" style={{ color: 'var(--gv-text-primary)' }}>
                {item.particulars || 'Unnamed Material'}
              </p>
              <p className="text-xs" style={{ color: '#33907c' }}>Item #{idx + 1} · Detail</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* key stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Quantity',   value: String(qty),                     icon: <Layers size={14} /> },
              { label: 'Unit Price', value: `KES ${unitP.toLocaleString()}`,  icon: <Tag    size={14} /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(51,144,124,0.08)', border: '1px solid rgba(51,144,124,0.15)' }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: '#33907c' }}>{icon}</div>
                <p className="text-xs mb-1" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* line total */}
          <div
            className="rounded-xl px-4 py-3 flex justify-between items-center"
            style={{ background: 'rgba(51,144,124,0.12)', border: '1px solid rgba(51,144,124,0.3)' }}
          >
            <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>Line Total</span>
            <span className="text-lg font-bold" style={{ color: '#33907c' }}>KES {lineTotal.toLocaleString()}</span>
          </div>

          {/* material name row */}
          <div
            className="flex justify-between items-start gap-4 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }}>Material</span>
            <span className="text-xs font-semibold text-right" style={{ color: 'var(--gv-text-primary)', wordBreak: 'break-word' }}>
              {item.particulars || '—'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c', border: '1px solid rgba(51,144,124,0.3)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Material Card ─────────────────────────────────────────────────────────────

interface MaterialCardProps {
  item:     ItemForm;
  idx:      number;
  onRemove: () => void;
  onClick:  () => void;
}

function MaterialCard({ item, idx, onRemove, onClick }: MaterialCardProps) {
  const qty       = parseFloat(item.quantity)   || 0;
  const unitP     = parseFloat(item.unit_price) || 0;
  const lineTotal = qty * unitP;

  return (
    <div
      onClick={onClick}
      className="group relative flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(51,144,124,0.08) 0%, rgba(51,144,124,0.03) 100%)',
        border:     '1px solid rgba(51,144,124,0.22)',
        transition: 'all 0.18s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background  = 'linear-gradient(135deg, rgba(51,144,124,0.15) 0%, rgba(51,144,124,0.07) 100%)';
        el.style.borderColor = 'rgba(51,144,124,0.5)';
        el.style.transform   = 'translateY(-1px)';
        el.style.boxShadow   = '0 6px 24px rgba(51,144,124,0.14)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background  = 'linear-gradient(135deg, rgba(51,144,124,0.08) 0%, rgba(51,144,124,0.03) 100%)';
        el.style.borderColor = 'rgba(51,144,124,0.22)';
        el.style.transform   = 'translateY(0)';
        el.style.boxShadow   = 'none';
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'rgba(51,144,124,0.2)', color: '#33907c' }}
        >
          {idx + 1}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--gv-text-primary)' }}>
            {item.particulars || 'Unnamed'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            {qty} units &nbsp;×&nbsp; KES {unitP.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <span className="text-sm font-bold" style={{ color: '#33907c' }}>
          KES {lineTotal.toLocaleString()}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [filtered, setFiltered]   = useState<Invoice[]>([]);
  const [search, setSearch]       = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected]   = useState<Invoice | null>(null);

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState(emptyForm());
  const [items, setItems]           = useState<ItemForm[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // material detail modal
  const [detailItem, setDetailItem] = useState<{ item: ItemForm; idx: number } | null>(null);

  // ── data fetching ─────────────────────────────────────────────────────────

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

  // ── item helpers ──────────────────────────────────────────────────────────

  const updateItem = (idx: number, field: keyof ItemForm, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx]  = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addItem    = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const totalAmount = items.reduce(
    (sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0),
    0
  );

  const isItemComplete = (it: ItemForm) =>
    it.particulars.trim() !== '' &&
    parseFloat(it.quantity) > 0  &&
    it.unit_price !== '';

  // ── create modal helpers ──────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm());
    setItems([emptyItem()]);
    setError(null);
    setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setError(null);
    setDetailItem(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.invoice_number.trim()) return setError('Invoice number is required.');
    if (!form.supplier_name.trim())  return setError('Supplier name is required.');
    if (!form.invoice_date)          return setError('Invoice date is required.');
    if (items.length === 0)          return setError('At least one item is required.');

    for (const [i, it] of items.entries()) {
      if (!it.particulars.trim())                        return setError(`Item ${i + 1}: material name is required.`);
      if (!it.quantity || parseFloat(it.quantity) <= 0) return setError(`Item ${i + 1}: quantity must be greater than 0.`);
      if (it.unit_price === '' || parseFloat(it.unit_price) < 0)
                                                          return setError(`Item ${i + 1}: unit price is required.`);
    }

    const payload = {
      invoice_number: form.invoice_number.trim(),
      lpo_number:     form.lpo_number.trim() || null,
      invoice_date:   form.invoice_date,
      supplier_name:  form.supplier_name.trim(),
      notes:          form.notes.trim()      || null,
      items: items.map((it) => ({
        particulars: it.particulars.trim(),
        quantity:    parseFloat(it.quantity),
        unit_price:  parseFloat(it.unit_price),
      })),
    };

    console.debug('[InvoicesPage] Submitting payload:', payload);

    try {
      setSubmitting(true);
      const { data } = await api.post('/invoices/create', payload);
      console.debug('[InvoicesPage] Create response:', data);
      closeCreate();
      await fetchInvoices();
    } catch (err: any) {
      console.error('[InvoicesPage] Create error:', err?.response ?? err);
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        err?.message ??
        'Failed to create invoice.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>Invoices</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openCreate} className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
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
              {search ? `No results for "${search}"` : 'No invoices found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Invoice No', 'Supplier', 'Site', 'Submitted By', 'Amount', 'Paid', 'Status', ''].map((h) => (
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
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.supplier_name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.site ?? '—'}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.submitted_by ?? '—'}</td>
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

      {/* ══════════════════════════════════════════════════════
          Create Invoice Modal
      ══════════════════════════════════════════════════════ */}
      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeCreate(); }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
              <div className="flex items-center gap-3">
                <div className="gv-icon-box"><Receipt size={18} className="text-[#33907c]" /></div>
                <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>New Invoice</h3>
              </div>
              <button onClick={closeCreate} className="p-2 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5">

              {/* Error banner */}
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
                  {error}
                </div>
              )}

              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Invoice Number *', key: 'invoice_number', placeholder: 'INV-001' },
                  { label: 'Supplier Name *',  key: 'supplier_name',  placeholder: 'e.g. ABC Supplies Ltd' },
                  { label: 'LPO Number',        key: 'lpo_number',     placeholder: 'Optional' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="gv-eyebrow mb-1 block">{label}</label>
                    <input
                      className="gv-input w-full text-sm"
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="gv-eyebrow mb-1 block">Invoice Date *</label>
                  <input
                    type="date"
                    className="gv-input w-full text-sm"
                    value={form.invoice_date}
                    onChange={(e) => setForm((p) => ({ ...p, invoice_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="gv-eyebrow mb-1 block">Notes</label>
                <textarea
                  className="gv-input w-full text-sm resize-none"
                  rows={2}
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              {/* ── Items ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="gv-eyebrow">Items *</p>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c' }}
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                {/* Entry rows */}
                <div className="space-y-3 mb-4">
                  {items.map((item, idx) => {
                    const lineTotal  = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                    const isComplete = isItemComplete(item);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl p-4 space-y-3"
                        style={{
                          background: 'var(--gv-glass-bg)',
                          border:     `1px solid ${isComplete ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: '#33907c' }}>Item {idx + 1}</span>
                          {items.length > 1 && (
                            <button onClick={() => removeItem(idx)} style={{ color: '#f87171' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Particulars — plain text input */}
                          <div className="col-span-2">
                            <label className="gv-eyebrow mb-1 block">Particulars *</label>
                            <input
                              type="text"
                              className="gv-input w-full text-sm"
                              placeholder="e.g. Portland Cement 50kg"
                              value={item.particulars}
                              onChange={(e) => updateItem(idx, 'particulars', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="gv-eyebrow mb-1 block">Quantity *</label>
                            <input
                              type="number" min="0.01" step="any"
                              className="gv-input w-full text-sm"
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="gv-eyebrow mb-1 block">Unit Price (KES) *</label>
                            <input
                              type="number" min="0" step="any"
                              className="gv-input w-full text-sm"
                              placeholder="0.00"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                            />
                          </div>
                        </div>

                        {lineTotal > 0 && (
                          <p className="text-xs text-right font-semibold" style={{ color: '#33907c' }}>
                            Line total: KES {lineTotal.toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Material cards (completed items only) ── */}
                {items.some(isItemComplete) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gv-text-subtle)' }}>
                      Added Materials — tap to view details
                    </p>
                    <div className="space-y-2">
                      {items.map((item, idx) =>
                        isItemComplete(item) ? (
                          <MaterialCard
                            key={idx}
                            item={item}
                            idx={idx}
                            onRemove={() => removeItem(idx)}
                            onClick={() => setDetailItem({ item, idx })}
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div
                className="flex justify-between items-center rounded-xl px-4 py-3"
                style={{ background: 'rgba(51,144,124,0.08)', border: '1px solid var(--gv-glass-border)' }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-muted)' }}>Total Amount</span>
                <span className="text-base font-bold" style={{ color: '#33907c' }}>KES {totalAmount.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeCreate}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold gv-btn-brand flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><Receipt size={15} /> Create Invoice</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Material detail modal ── */}
      {detailItem && (
        <MaterialDetailModal
          item={detailItem.item}
          idx={detailItem.idx}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          Invoice Detail Modal
      ══════════════════════════════════════════════════════ */}
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
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
              <div className="flex items-center gap-3">
                <div className="gv-icon-box"><Receipt size={18} className="text-[#33907c]" /></div>
                <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>Invoice #{selected.invoice_number}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Supplier',        value: selected.supplier_name },
                  { label: 'LPO Number',      value: selected.lpo_number ?? '—' },
                  { label: 'Delivery Number', value: selected.delivery_number ?? '—' },
                  { label: 'Invoice Date',    value: new Date(selected.invoice_date).toLocaleDateString() },
                  { label: 'Site',            value: selected.site ?? '—' },
                  { label: 'Submitted By',    value: selected.submitted_by ?? '—' },
                  { label: 'Submitted On',    value: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—' },
                  { label: 'Status',          value: selected.status.replace(/_/g, ' ') },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="gv-eyebrow mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {selected.items && selected.items.length > 0 && (
                <div>
                  <p className="gv-eyebrow mb-3">Items</p>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gv-glass-border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                          {['Particular', 'Qty', 'Unit Price', 'Total'].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((item, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                            <td className="px-4 py-2.5" style={{ color: 'var(--gv-text-primary)' }}>{item.particular}</td>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}