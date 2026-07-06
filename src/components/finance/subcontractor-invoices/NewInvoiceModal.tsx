'use client';

import { useEffect } from 'react';
import { Plus, X, Trash2, AlertCircle } from 'lucide-react';
import { useNewInvoiceForm } from '@/hooks/subcontractor-invoices/useNewInvoiceForm';
import { formatKes } from '@/lib/utils/currency';

const inputCls =
  'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white ' +
  'placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] [color-scheme:dark]';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1';

interface NewInvoiceModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function NewInvoiceModal({ onClose, onCreated }: NewInvoiceModalProps) {
  const {
    form,
    setField,
    setItem,
    addItem,
    removeItem,
    grandTotal,
    submitting,
    error,
    submit,
  } = useNewInvoiceForm(() => {
    onCreated();
    onClose();
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f1f2e] border border-white/20 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">New Subcontractor Invoice</h2>
            <p className="text-xs text-white/40 mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Invoice No. <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. INV-001"
                value={form.invoiceNo}
                onChange={(e) => setField('invoiceNo', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>
                Invoice Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.invoiceDate}
                onChange={(e) => setField('invoiceDate', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Contractor Name <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Sofa and Son Ltd"
                value={form.contractorName}
                onChange={(e) => setField('contractorName', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Line Items
              </p>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs text-[#33907C] hover:text-[#4db89f] transition-colors font-semibold"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_90px_32px] gap-2 px-1">
                {['Particulars', 'Qty', 'Unit Price', ''].map((h) => (
                  <p key={h} className="text-xs font-semibold uppercase tracking-wider text-white/30">
                    {h}
                  </p>
                ))}
              </div>

              {form.items.map((item, idx) => {
                const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div key={idx} className="grid grid-cols-[1fr_80px_90px_32px] gap-2 items-center">
                    <input
                      className={inputCls}
                      placeholder="Description"
                      value={item.particulars}
                      onChange={(e) => setItem(idx, 'particulars', e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="1"
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => setItem(idx, 'unitPrice', e.target.value)}
                    />
                    <button
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30
                                 hover:text-red-400 hover:bg-red-400/10 transition-colors
                                 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>

                    {lineTotal > 0 && (
                      <div className="col-span-4 text-right text-xs text-white/30 -mt-1 pr-10">
                        = KES {formatKes(lineTotal)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {grandTotal > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="bg-[#33907C]/10 border border-[#33907C]/30 rounded-xl px-5 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                    Grand Total
                  </p>
                  <p className="text-xl font-bold text-[#33907C]">KES {formatKes(grandTotal)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white bg-white/5
                       hover:bg-white/10 transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                       bg-[#33907C] hover:bg-[#2a7566] text-white transition-colors
                       shadow-lg shadow-[#33907C]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus size={15} />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}