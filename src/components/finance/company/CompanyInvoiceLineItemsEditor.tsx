'use client';

import { Plus, Trash2 } from 'lucide-react';
import { CompanyInvoiceItemForm } from '@/hooks/company-invoices/useCreateCompanyInvoiceForm';

interface CompanyInvoiceLineItemsEditorProps {
  items: CompanyInvoiceItemForm[];
  onUpdateItem: (idx: number, field: keyof CompanyInvoiceItemForm, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
}

export default function CompanyInvoiceLineItemsEditor({
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}: CompanyInvoiceLineItemsEditorProps) {
  return (
    <div className="gv-card">
      <div className="flex items-center justify-between mb-4">
        <p className="gv-eyebrow text-label-sm">Line Items *</p>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c' }}
        >
          <Plus size={12} /> Add Item
        </button>
      </div>

      <div
        className="grid gap-3 px-3 py-2.5 rounded-lg mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ gridTemplateColumns: '1fr 130px 160px auto', background: 'rgba(51,144,124,0.08)', color: '#33907c' }}
      >
        <span>Particulars</span>
        <span>Quantity</span>
        <span>Unit Price (KES)</span>
        <span />
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
          return (
            <div key={idx} className="grid gap-3 items-center" style={{ gridTemplateColumns: '1fr 130px 160px auto' }}>
              <input
                type="text"
                className="gv-input text-sm"
                placeholder="e.g. Office Supplies"
                value={item.particulars}
                onChange={(e) => onUpdateItem(idx, 'particulars', e.target.value)}
              />
              <input
                type="text"
                inputMode="decimal"
                className="gv-input text-sm"
                placeholder="0"
                value={item.quantity}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*\.?\d*$/.test(v)) onUpdateItem(idx, 'quantity', v);
                }}
              />
              <input
                type="text"
                inputMode="decimal"
                className="gv-input text-sm"
                placeholder="0.00"
                value={item.unit_price}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*\.?\d*$/.test(v)) onUpdateItem(idx, 'unit_price', v);
                }}
              />
              <div className="flex items-center gap-2">
                {lineTotal > 0 && (
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#33907c' }}>
                    KES {lineTotal.toLocaleString()}
                  </span>
                )}
                {items.length > 1 && (
                  <button
                    onClick={() => onRemoveItem(idx)}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}