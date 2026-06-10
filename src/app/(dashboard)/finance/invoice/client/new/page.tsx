'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

interface Site {
  id: number;
  name: string;
}

interface InvoiceItem {
  particulars: string;
  quantity:    string;
  unit_price:  string;
}

const emptyItem = (): InvoiceItem => ({
  particulars: '',
  quantity:  '',
  unit_price:  '',
});

export default function NewClientInvoicePage() {
  const router  = useRouter();
  const notesRef  = useRef<HTMLTextAreaElement>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    client_name: '',
    site_id: '',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  useEffect(() => {
    api.get('/sites/list')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        const list    = Array.isArray(payload) ? payload : payload?.items ?? [];
        setSites(list);
      })
      .catch(() => setSites([]))
      .finally(() => setSitesLoading(false));
  }, []);
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto';
      notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
    }
  }, [form.notes]);

  /* ── line item helpers ── */
  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getLineTotal = (item: InvoiceItem) => {
    const qty   = parseFloat(item.quantity)   || 0;
    const price = parseFloat(item.unit_price) || 0;
    return qty * price;
  };

  const grandTotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (const item of items) {
      if (!item.particulars || !item.quantity || !item.unit_price) {
        setError('All line items must have particulars, quantity and unit price');
        return;
      }
    }

    setIsLoading(true);
    try {
      await api.post('/client-invoices/create', {
        invoice_number: form.invoice_number,
        invoice_date: form.invoice_date,
        client_name: form.client_name,
        site_id:  Number(form.site_id),
        notes:  form.notes || null,
        items: items.map((item) => ({
          particulars: item.particulars,
          quantity:    parseFloat(item.quantity),
          unit_price:  parseFloat(item.unit_price),
        })),
      });
      router.push('/finance/invoice/client');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } };
      setError(
        e.response?.data?.message ||
        e.response?.data?.detail  ||
        'Failed to create invoice'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header  */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">New Client Invoice</h2>
          <p className="text-sm text-blue-200/60">Create an invoice for a client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Invoice details ── */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">Invoice Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
                Invoice Number *
              </label>
              <input
                type="text"
                value={form.invoice_number}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                placeholder="e.g. CI-2024-001"
                required
                className={inputClass}
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
                Invoice Date *
              </label>
              <input
                type="date"
                value={form.invoice_date}
                onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                required
                max={today}
                className={inputClass}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
                Client Name *
              </label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                placeholder="e.g. Acme Corporation"
                required
                className={inputClass}
              />
            </div>

            {/* Site */}
            <div>
              <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
                Site *
              </label>
              <select
                value={form.site_id}
                onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                required
                className={`${inputClass} [&>option]:bg-[#0d1b2a]`}
              >
                <option value="">
                  {sitesLoading
                    ? 'Loading sites...'
                    : sites.length === 0
                    ? 'No sites available'
                    : 'Select a site...'}
                </option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
              Notes
            </label>
            <textarea
              ref={notesRef}
              value={form.notes}
              onChange={(e) => {
                setForm({ ...form, notes: e.target.value });
                if (notesRef.current) {
                  notesRef.current.style.height = 'auto';
                  notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
                }
              }}
              placeholder="Optional notes..."
              rows={2}
              className={`${inputClass} resize-none overflow-hidden transition-[height] duration-200 ease-in-out`}
            />
          </div>
        </div>

        {/* ── Line items ── */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Line Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs text-[#33907C] hover:text-[#2a7a69] transition-colors font-medium"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-white/40 uppercase tracking-wide px-1">
            <div className="col-span-5">Particulars</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-1" />
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.particulars}
                    onChange={(e) => updateItem(index, 'particulars', e.target.value)}
                    placeholder="Description of work/item"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-[#33907C] px-1">
                    KES {getLineTotal(item).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grand total */}
          <div
            className="flex items-center justify-end gap-4 pt-3 border-t"
            style={{ borderColor: 'var(--gv-glass-border)' }}
          >
            <span className="text-sm font-medium text-white/60">Grand Total</span>
            <span className="text-xl font-bold text-[#33907C]">
              KES {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#33907C] hover:bg-[#2a7a69] text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}