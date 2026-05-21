'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Plus, X, Receipt, Trash2, Layers, Tag } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ItemForm {
  description: string;
  quantity:    string;
  unit_price:  string;
}

const emptyItem = (): ItemForm => ({ description: '', quantity: '', unit_price: '' });

const emptyForm = () => ({
  invoice_number:     '',
  lpo_number:         '',
  invoice_date:       '',
  subcontractor_name: '',
  work_description:   '',
  notes:              '',
});

// ── Item Detail Modal ─────────────────────────────────────────────────────────

interface ItemDetailModalProps {
  item:    ItemForm;
  idx:     number;
  onClose: () => void;
}

function ItemDetailModal({ item, idx, onClose }: ItemDetailModalProps) {
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
                {item.description || 'Unnamed Item'}
              </p>
              <p className="text-xs" style={{ color: '#33907c' }}>Item #{idx + 1} · Detail</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Quantity',   value: String(qty),                    icon: <Layers size={14} /> },
              { label: 'Unit Price', value: `KES ${unitP.toLocaleString()}`, icon: <Tag    size={14} /> },
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

          <div
            className="rounded-xl px-4 py-3 flex justify-between items-center"
            style={{ background: 'rgba(51,144,124,0.12)', border: '1px solid rgba(51,144,124,0.3)' }}
          >
            <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>Line Total</span>
            <span className="text-lg font-bold" style={{ color: '#33907c' }}>KES {lineTotal.toLocaleString()}</span>
          </div>

          <div
            className="flex justify-between items-start gap-4 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }}>Description</span>
            <span className="text-xs font-semibold text-right" style={{ color: 'var(--gv-text-primary)', wordBreak: 'break-word' }}>
              {item.description || '—'}
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

// ── Item Card ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item:     ItemForm;
  idx:      number;
  onRemove: () => void;
  onClick:  () => void;
}

function ItemCard({ item, idx, onRemove, onClick }: ItemCardProps) {
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
            {item.description || 'Unnamed'}
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

// ── Create Subcontractor Invoice Modal ────────────────────────────────────────

interface CreateSubcontractorModalProps {
  onClose:   () => void;
  onSuccess: () => void;
}

export default function CreateSubcontractorModal({ onClose, onSuccess }: CreateSubcontractorModalProps) {
  const [form, setForm]             = useState(emptyForm());
  const [items, setItems]           = useState<ItemForm[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<{ item: ItemForm; idx: number } | null>(null);

  // ── item helpers ────────────────────────────────────────────────────────────

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
    it.description.trim() !== '' &&
    parseFloat(it.quantity) > 0  &&
    it.unit_price !== '';

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError(null);

    if (!form.invoice_number.trim())     return setError('Invoice number is required.');
    if (!form.subcontractor_name.trim()) return setError('Sub-contractor name is required.');
    if (!form.invoice_date)              return setError('Invoice date is required.');
    if (items.length === 0)              return setError('At least one item is required.');

    for (const [i, it] of items.entries()) {
      if (!it.description.trim())                        return setError(`Item ${i + 1}: description is required.`);
      if (!it.quantity || parseFloat(it.quantity) <= 0) return setError(`Item ${i + 1}: quantity must be greater than 0.`);
      if (it.unit_price === '' || parseFloat(it.unit_price) < 0)
                                                          return setError(`Item ${i + 1}: unit price is required.`);
    }

    const payload = {
      invoice_number:     form.invoice_number.trim(),
      lpo_number:         form.lpo_number.trim()         || null,
      invoice_date:       form.invoice_date,
      subcontractor_name: form.subcontractor_name.trim(),
      work_description:   form.work_description.trim()   || null,
      notes:              form.notes.trim()               || null,
      items: items.map((it) => ({
        description: it.description.trim(),
        quantity:    parseFloat(it.quantity),
        unit_price:  parseFloat(it.unit_price),
      })),
    };

    console.debug('[CreateSubcontractorModal] Submitting payload:', payload);

    try {
      setSubmitting(true);
      const { data } = await api.post('/invoices/subcontractor/create', payload);
      console.debug('[CreateSubcontractorModal] Response:', data);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[CreateSubcontractorModal] Error:', err?.response ?? err);
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

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><Receipt size={18} className="text-[#33907c]" /></div>
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>New Sub-Contractor Invoice</h3>
                <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>Record invoice from a sub-contractor</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--gv-text-muted)' }}>
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">

            {/* Error banner */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
              >
                {error}
              </div>
            )}

            {/* Basic fields */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Invoice Number *',     key: 'invoice_number',     placeholder: 'INV-001' },
                { label: 'Sub-Contractor Name *', key: 'subcontractor_name', placeholder: 'e.g. ABC Contractors Ltd' },
                { label: 'LPO Number',            key: 'lpo_number',         placeholder: 'Optional' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="gv-eyebrow mb-1 block">{label}</label>
                  <input
                    type="text"
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

            {/* Work description — spans full width */}
            <div>
              <label className="gv-eyebrow mb-1 block">Work Description</label>
              <input
                type="text"
                className="gv-input w-full text-sm"
                placeholder="e.g. Foundation excavation and concrete works — Block C"
                value={form.work_description}
                onChange={(e) => setForm((p) => ({ ...p, work_description: e.target.value }))}
              />
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

            {/* Items */}
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
                        <div className="col-span-2">
                          <label className="gv-eyebrow mb-1 block">Description *</label>
                          <input
                            type="text"
                            className="gv-input w-full text-sm"
                            placeholder="e.g. Labour — concrete pouring"
                            value={item.description}
                            onChange={(e) => updateItem(idx, 'description', e.target.value)}
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

              {/* Completed item cards */}
              {items.some(isItemComplete) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gv-text-subtle)' }}>
                    Added Items — tap to view details
                  </p>
                  <div className="space-y-2">
                    {items.map((item, idx) =>
                      isItemComplete(item) ? (
                        <ItemCard
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
                onClick={onClose}
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

      {/* Item detail modal */}
      {detailItem && (
        <ItemDetailModal
          item={detailItem.item}
          idx={detailItem.idx}
          onClose={() => setDetailItem(null)}
        />
      )}
    </>
  );
}