'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Trash2, Calculator, Receipt, Truck, Building2, Calendar } from 'lucide-react';

interface InvoiceItem {
  particular: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();

  // Supplier & Reference
  const [supplierName, setSupplierName] = useState('');
  const [lpoNumber, setLpoNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    particular: '', quantity: '', unit_price: '',
  });

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = items.reduce((sum, i) => sum + i.total_price, 0);
  const itemTotal = (parseFloat(newItem.quantity || '0') * parseFloat(newItem.unit_price || '0'));

  const addItem = () => {
    if (!newItem.particular || !newItem.quantity || !newItem.unit_price) return;
    setItems([...items, {
      particular: newItem.particular,
      quantity: parseFloat(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      total_price: itemTotal,
    }]);
    setNewItem({ particular: '', quantity: '', unit_price: '' });
    setShowItemForm(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one invoice item');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await api.post('/invoices/create', {
        supplier_name: supplierName,
        lpo_number: lpoNumber,
        invoice_number: invoiceNumber,
        delivery_number: deliveryNumber,
        invoice_date: invoiceDate,
        total_amount: totalAmount,
        items,
      });
      router.push('/finance/invoices');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          Submit Invoice
        </h2>
        <p style={{ color: 'var(--gv-text-muted)' }} className="text-sm mt-1">
          Fill in the details below and submit for approval
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Supplier & Reference ── */}
        <div className="gv-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="gv-icon-box">
              <Building2 size={18} className="text-[#33907c]" />
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
              Supplier & Reference Details
            </h3>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="gv-label">Supplier Name *</label>
            <input
              className="gv-input"
              placeholder="e.g. Bamburi Cement Ltd"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              required
            />
          </div>

          {/* LPO & Invoice Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="gv-label">L.P.O No. *</label>
              <input
                className="gv-input"
                placeholder="e.g. LPO-2026-001"
                value={lpoNumber}
                onChange={(e) => setLpoNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="gv-label">Invoice No. *</label>
              <input
                className="gv-input"
                placeholder="e.g. INV-2026-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Delivery Number & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="gv-label">Delivery No. *</label>
              <input
                className="gv-input"
                placeholder="e.g. DN-2026-001"
                value={deliveryNumber}
                onChange={(e) => setDeliveryNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="gv-label">Invoice Date *</label>
              <input
                type="date"
                className="gv-input"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>

        {/* ── Invoice Items ── */}
        <div className="gv-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="gv-icon-box">
                <Receipt size={18} className="text-[#33907c]" />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                Invoice Items
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'rgba(51,144,124,0.15)',
                color: '#33907c',
                border: '1px solid rgba(51,144,124,0.3)',
              }}
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          {/* Add Item Form */}
          {showItemForm && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--gv-text-muted)' }}>
                New Item
              </p>
              <div>
                <label className="gv-label">Particulars *</label>
                <input
                  className="gv-input"
                  placeholder="e.g. Ballast, Cement, Steel Rods"
                  value={newItem.particular}
                  onChange={(e) => setNewItem({ ...newItem, particular: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gv-label">Quantity *</label>
                  <input
                    type="number"
                    className="gv-input"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="gv-label">Unit Price (KES) *</label>
                  <input
                    type="number"
                    className="gv-input"
                    placeholder="0.00"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                  />
                </div>
              </div>

              {/* Auto total */}
              <div
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ background: 'rgba(51,144,124,0.10)', border: '1px solid rgba(51,144,124,0.2)' }}
              >
                <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-[#33907c]" />
                  <span className="text-sm font-medium text-[#33907c]">Total Price</span>
                </div>
                <span className="text-base font-bold text-[#33907c]">
                  KES {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowItemForm(false); setNewItem({ particular: '', quantity: '', unit_price: '' }); }}
                  className="flex-1 py-2 rounded-lg text-sm transition-colors gv-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!newItem.particular || !newItem.quantity || !newItem.unit_price}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors gv-btn-brand disabled:opacity-40"
                >
                  Add Item
                </button>
              </div>
            </div>
          )}

          {/* Items Table */}
          {items.length === 0 && !showItemForm ? (
            <div
              className="flex flex-col items-center justify-center py-10 rounded-xl"
              style={{ border: '1px dashed var(--gv-glass-border)' }}
            >
              <Receipt size={36} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
              <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
                No items added yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--gv-text-faint)' }}>
                Tap "Add Item" to get started
              </p>
            </div>
          ) : items.length > 0 ? (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--gv-glass-border)' }}
            >
              {/* Table Header */}
              <div
                className="grid grid-cols-12 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(51,144,124,0.08)', color: '#33907c' }}
              >
                <span className="col-span-5">Particulars</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-center">Unit Price</span>
                <span className="col-span-2 text-right">Total</span>
                <span className="col-span-1" />
              </div>

              {/* Rows */}
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 px-4 py-3 items-center text-sm"
                  style={{
                    borderTop: '1px solid var(--gv-glass-border)',
                    color: 'var(--gv-text-primary)',
                  }}
                >
                  <span className="col-span-5">{item.particular}</span>
                  <span className="col-span-2 text-center" style={{ color: 'var(--gv-text-muted)' }}>
                    {item.quantity}
                  </span>
                  <span className="col-span-2 text-center" style={{ color: 'var(--gv-text-muted)' }}>
                    {item.unit_price.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-right font-semibold text-[#33907c]">
                    {item.total_price.toLocaleString()}
                  </span>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Total Amount (read-only) ── */}
        <div
          className="flex items-center justify-between rounded-xl px-6 py-4"
          style={{ background: 'rgba(51,144,124,0.10)', border: '1px solid rgba(51,144,124,0.25)' }}
        >
          <div className="flex items-center gap-3">
            <div className="gv-icon-box">
              <Calculator size={18} className="text-[#33907c]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--gv-text-subtle)' }}>
                Total Invoice Amount
              </p>
              <p className="text-2xl font-bold text-[#33907c] mt-0.5">
                KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c' }}
          >
            Auto
          </span>
        </div>

        {/* ── Attachment note ──
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gv-glass-border)' }}
        >
          <Truck size={16} className="text-[#33907c] mt-0.5 shrink-0" />
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            Physical attachments (delivery notes, receipts) should be submitted to the admin office along with this digital submission.
          </p>
        </div> */}

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 gv-btn-outline py-3 rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="flex-1 gv-btn-brand py-3 rounded-xl font-semibold disabled:opacity-40"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}