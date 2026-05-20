'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Material } from '@/types';
import { Plus, Trash2, Calculator, Receipt, Building2 } from 'lucide-react';

interface ItemForm {
  material_id: number | null;
  particulars: string;
  quantity: string;
  unit_price: string;
}

interface InvoiceItem {
  material_id: number;
  particulars: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  material_name: string;
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [supplierName, setSupplierName]       = useState('');
  const [lpoNumber, setLpoNumber]             = useState('');
  const [invoiceNumber, setInvoiceNumber]     = useState('');
  const [deliveryNumber, setDeliveryNumber]   = useState('');
  const [invoiceDate, setInvoiceDate]         = useState('');
  const [notes, setNotes]                     = useState('');

  const [materials, setMaterials]             = useState<Material[]>([]);
  const [items, setItems]                     = useState<InvoiceItem[]>([]);
  const [showItemForm, setShowItemForm]       = useState(false);
  const [newItem, setNewItem]                 = useState<ItemForm>({
    material_id: null, particulars: '', quantity: '', unit_price: '',
  });

  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [error, setError]                     = useState('');

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get('/materials/materials');
      setMaterials(data);
    } catch (e) {
      console.error('Failed to fetch materials', e);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + i.total_price, 0);
  const itemTotal   = (parseFloat(newItem.quantity || '0') * parseFloat(newItem.unit_price || '0'));

  const handleMaterialSelect = (materialId: string) => {
    const mat = materials.find((m) => m.id === parseInt(materialId));
    setNewItem({
      ...newItem,
      material_id: mat?.id ?? null,
      particulars: mat?.name ?? '',
    });
  };

  const addItem = () => {
    if (!newItem.material_id || !newItem.particulars || !newItem.quantity || !newItem.unit_price) return;
    const mat = materials.find((m) => m.id === newItem.material_id);
    setItems([...items, {
      material_id:   newItem.material_id,
      particulars:   newItem.particulars,
      quantity:      parseFloat(newItem.quantity),
      unit_price:    parseFloat(newItem.unit_price),
      total_price:   itemTotal,
      material_name: mat?.name ?? '',
    }]);
    setNewItem({ material_id: null, particulars: '', quantity: '', unit_price: '' });
    setShowItemForm(false);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { setError('Please add at least one invoice item'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await api.post('/invoices/create', {
        invoice_number:  invoiceNumber,
        lpo_number:      lpoNumber || null,
        delivery_number: deliveryNumber || null,
        invoice_date:    invoiceDate,
        supplier_name:   supplierName,
        notes:           notes || null,
        items: items.map((i) => ({
          material_id: i.material_id,
          particulars: i.particulars,
          quantity:    i.quantity,
          unit_price:  i.unit_price,
        })),
      });
      router.push('/finance/invoices');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to submit invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          Submit Invoice
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--gv-text-muted)' }}>
          Fill in the details below and submit for approval
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm"
               style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* ── Supplier & Reference ── */}
        <div className="gv-card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="gv-icon-box">
              <Building2 size={18} className="text-[#33907c]" />
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
              Supplier & Reference Details
            </h3>
          </div>

          <div>
            <label className="gv-label">Supplier Name *</label>
            <input className="gv-input" placeholder="e.g. Bamburi Cement Ltd"
              value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="gv-label">L.P.O No.</label>
              <input className="gv-input" placeholder="e.g. LPO-2026-001"
                value={lpoNumber} onChange={(e) => setLpoNumber(e.target.value)} />
            </div>
            <div>
              <label className="gv-label">Invoice No. *</label>
              <input className="gv-input" placeholder="e.g. INV-2026-001"
                value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="gv-label">Delivery No.</label>
              <input className="gv-input" placeholder="e.g. DN-2026-001"
                value={deliveryNumber} onChange={(e) => setDeliveryNumber(e.target.value)} />
            </div>
            <div>
              <label className="gv-label">Invoice Date *</label>
              <input type="date" className="gv-input" value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)} required
                style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label className="gv-label">Notes</label>
            <textarea className="gv-input !h-20 resize-none" placeholder="Optional notes..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
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
            <button type="button" onClick={() => setShowItemForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c', border: '1px solid rgba(51,144,124,0.3)' }}>
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Add Item Form */}
          {showItemForm && (
            <div className="rounded-xl p-4 space-y-3"
                 style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--gv-text-muted)' }}>New Item</p>

              {/* Material selector */}
              <div>
                <label className="gv-label">Material *</label>
                <select
                  className="gv-input"
                  value={newItem.material_id ?? ''}
                  onChange={(e) => handleMaterialSelect(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Select a material...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} {m.unit ? `(${m.unit})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Particulars — editable after material selected */}
              <div>
                <label className="gv-label">Particulars *</label>
                <input className="gv-input" placeholder="Description of item"
                  value={newItem.particulars}
                  onChange={(e) => setNewItem({ ...newItem, particulars: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gv-label">Quantity *</label>
                  <input type="number" className="gv-input" placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="gv-label">Unit Price (KES) *</label>
                  <input type="number" className="gv-input" placeholder="0.00"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })} />
                </div>
              </div>

              {/* Auto total */}
              <div className="flex items-center justify-between rounded-lg px-4 py-3"
                   style={{ background: 'rgba(51,144,124,0.10)', border: '1px solid rgba(51,144,124,0.2)' }}>
                <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-[#33907c]" />
                  <span className="text-sm font-medium text-[#33907c]">Total Price</span>
                </div>
                <span className="text-base font-bold text-[#33907c]">
                  KES {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex gap-2">
                <button type="button"
                  onClick={() => { setShowItemForm(false); setNewItem({ material_id: null, particulars: '', quantity: '', unit_price: '' }); }}
                  className="flex-1 py-2 rounded-lg text-sm gv-btn-outline">
                  Cancel
                </button>
                <button type="button" onClick={addItem}
                  disabled={!newItem.material_id || !newItem.particulars || !newItem.quantity || !newItem.unit_price}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold gv-btn-brand disabled:opacity-40">
                  Add Item
                </button>
              </div>
            </div>
          )}

          {/* Items table */}
          {items.length === 0 && !showItemForm ? (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl"
                 style={{ border: '1px dashed var(--gv-glass-border)' }}>
              <Receipt size={36} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
              <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>No items added yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--gv-text-faint)' }}>Tap "Add Item" to get started</p>
            </div>
          ) : items.length > 0 ? (
            <div className="rounded-xl overflow-hidden"
                 style={{ border: '1px solid var(--gv-glass-border)' }}>
              <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                   style={{ background: 'rgba(51,144,124,0.08)', color: '#33907c' }}>
                <span className="col-span-4">Particulars</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-center">Unit Price</span>
                <span className="col-span-2 text-right">Total</span>
                <span className="col-span-1" />
              </div>
              {items.map((item, index) => (
                <div key={index}
                     className="grid grid-cols-12 px-4 py-3 items-center text-sm"
                     style={{ borderTop: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-primary)' }}>
                  <span className="col-span-4">{item.particulars}</span>
                  <span className="col-span-2 text-center" style={{ color: 'var(--gv-text-muted)' }}>
                    {item.quantity}
                  </span>
                  <span className="col-span-3 text-center" style={{ color: 'var(--gv-text-muted)' }}>
                    {item.unit_price.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-right font-semibold text-[#33907c]">
                    {item.total_price.toLocaleString()}
                  </span>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(index)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Total (read-only) ── */}
        <div className="flex items-center justify-between rounded-xl px-6 py-4"
             style={{ background: 'rgba(51,144,124,0.10)', border: '1px solid rgba(51,144,124,0.25)' }}>
          <div className="flex items-center gap-3">
            <div className="gv-icon-box">
              <Calculator size={18} className="text-[#33907c]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--gv-text-subtle)' }}>
                Total Invoice Value
              </p>
              <p className="text-2xl font-bold text-[#33907c] mt-0.5">
                KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c' }}>
            Auto
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 gv-btn-outline py-3 rounded-xl font-medium">
            Cancel
          </button>
          <button type="submit"
            disabled={isSubmitting || items.length === 0}
            className="flex-1 gv-btn-brand py-3 rounded-xl font-semibold disabled:opacity-40">
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}