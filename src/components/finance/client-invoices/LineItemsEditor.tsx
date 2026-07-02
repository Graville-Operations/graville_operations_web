import { Plus, Trash2 } from 'lucide-react';
import { ClientInvoiceItemDraft } from '@/types/client-invoice';

interface LineItemsEditorProps {
  items: ClientInvoiceItemDraft[];
  onUpdateItem: (index: number, field: keyof ClientInvoiceItemDraft, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  getLineTotal: (item: ClientInvoiceItemDraft) => number;
  grandTotal: number;
  inputClass: string;
}

export function LineItemsEditor({
  items, onUpdateItem, onAddItem, onRemoveItem, getLineTotal, grandTotal, inputClass,
}: LineItemsEditorProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Line Items</h3>
        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-1.5 text-xs text-[#33907C] hover:text-[#2a7a69] transition-colors font-medium"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-white/40 uppercase tracking-wide px-1">
        <div className="col-span-5">Particulars</div>
        <div className="col-span-2">Quantity</div>
        <div className="col-span-2">Unit Price</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-1" />
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <input
                type="text"
                value={item.particulars}
                onChange={(e) => onUpdateItem(index, 'particulars', e.target.value)}
                placeholder="Description of work/item"
                required
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdateItem(index, 'quantity', e.target.value)}
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
                onChange={(e) => onUpdateItem(index, 'unit_price', e.target.value)}
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
                onClick={() => onRemoveItem(index)}
                disabled={items.length === 1}
                className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-20"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

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
  );
}