'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, ArrowLeft, Receipt, Trash2 } from 'lucide-react';

interface ItemForm {
  particulars: string;
  quantity:    string;
  unit_price:  string;
}

const emptyItem = (): ItemForm => ({ particulars: '', quantity: '', unit_price: '' });
const emptyForm = () => ({ invoice_number: '', invoice_date: '', notes: '' });

export default function CreateCompanyInvoicePage() {
  const router = useRouter();
  const today  = new Date().toISOString().split('T')[0];

  const [form, setForm]             = useState(emptyForm());
  const [items, setItems]           = useState<ItemForm[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const updateItem = (idx: number, field: keyof ItemForm, value: string) => {
    setItems((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  const totalAmount = items.reduce(
    (sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0
  );

  const handleSubmit = async () => {
    setError(null);
    if (!form.invoice_number.trim()) return setError('Invoice number is required.');
    if (!form.invoice_date)          return setError('Invoice date is required.');
    if (items.length === 0)          return setError('At least one item is required.');
    for (const [i, it] of items.entries()) {
      if (!it.particulars.trim())                        return setError(`Item ${i + 1}: particulars is required.`);
      if (!it.quantity || parseFloat(it.quantity) <= 0) return setError(`Item ${i + 1}: quantity must be greater than 0.`);
      if (it.unit_price === '' || parseFloat(it.unit_price) < 0) return setError(`Item ${i + 1}: unit price is required.`);
    }

    const payload = {
      invoice_number: form.invoice_number.trim(),
      invoice_date:   form.invoice_date,
      notes:          form.notes.trim() || null,
      items: items.map((it) => ({
        particulars: it.particulars.trim(),
        quantity:    parseFloat(it.quantity),
        unit_price:  parseFloat(it.unit_price),
      })),
    };

    try {
      setSubmitting(true);
      await api.post('/company-invoices/create', payload);
      router.push('/dashboard/finance/invoice/company');
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ?? 'Failed to create invoice.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full" style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg"
          style={{
            background: 'var(--gv-glass-bg)',
            border: '1px solid var(--gv-glass-border)',
            color: 'var(--gv-text-muted)',
          }}
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h2 className="text-base font-bold leading-tight" style={{ color: 'var(--gv-text-primary)' }}>New Company Invoice</h2>
          <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>Fill in the details below</p>
        </div>
      </div>
      {error && (
        <div className="rounded-lg px-3 py-2 text-xs font-medium"
          style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
          {error}
        </div>
      )}
      <div className="gv-card" style={{ padding: '14px 16px' }}>
        <p className="gv-eyebrow text-[10px] mb-3">Invoice Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="gv-eyebrow mb-1 block" style={{ fontSize: '10px' }}>Invoice Number *</label>
            <input
              type="text"
              className="gv-input w-full text-xs"
              placeholder="CINV-001"
              value={form.invoice_number}
              onChange={(e) => setForm((p) => ({ ...p, invoice_number: e.target.value }))}
            />
          </div>
          <div>
            <label className="gv-eyebrow mb-1 block" style={{ fontSize: '10px' }}>Invoice Date *</label>
            <input
              type="date"
              className="gv-input w-full text-xs"
              max={today}
              value={form.invoice_date}
              onChange={(e) => setForm((p) => ({ ...p, invoice_date: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <label className="gv-eyebrow mb-1 block" style={{ fontSize: '10px' }}>Notes</label>
            <textarea
              className="gv-input w-full text-xs resize-none"
              rows={2}
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>
      </div>
      <div className="gv-card" style={{ padding: '14px 16px' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="gv-eyebrow text-[10px]">Line Items *</p>
          <button
            onClick={() => setItems((p) => [...p, emptyItem()])}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md"
            style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c' }}
          >
            <Plus size={11} /> Add Item
          </button>
        </div>
        <div
          className="grid gap-2 px-2 py-1.5 rounded-md mb-2 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: '1fr 90px 120px auto',
            background: 'rgba(51,144,124,0.08)',
            color: '#33907c',
          }}
        >
          <span>Particulars</span>
          <span>Quantity</span>
          <span>Unit Price (KES)</span>
          <span />
        </div>

        <div className="space-y-1.5">
          {items.map((item, idx) => {
            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            return (
              <div
                key={idx}
                className="grid gap-2 items-center"
                style={{ gridTemplateColumns: '1fr 90px 120px auto' }}
              >
                <input
                  type="text"
                  className="gv-input text-xs"
                  placeholder="e.g. Office Supplies"
                  value={item.particulars}
                  onChange={(e) => updateItem(idx, 'particulars', e.target.value)}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className="gv-input text-xs"
                  placeholder="0"
                  value={item.quantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) updateItem(idx, 'quantity', v);
                  }}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className="gv-input text-xs"
                  placeholder="0.00"
                  value={item.unit_price}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) updateItem(idx, 'unit_price', v);
                  }}
                />
                <div className="flex items-center gap-1.5">
                  {lineTotal > 0 && (
                    <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: '#33907c' }}>
                      {lineTotal.toLocaleString()}
                    </span>
                  )}
                  {items.length > 1 && (
                    <button
                      onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                      className="p-1 rounded-md shrink-0"
                      style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(51,144,124,0.08)', border: '1px solid var(--gv-glass-border)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--gv-text-muted)' }}>Total</span>
          <span className="text-base font-bold" style={{ color: '#33907c' }}>KES {totalAmount.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-lg text-xs font-semibold gv-btn-brand flex items-center gap-1.5"
          >
            {submitting
              ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              : <><Receipt size={13} /> Create Invoice</>}
          </button>
        </div>
      </div>

    </div>
  );
}