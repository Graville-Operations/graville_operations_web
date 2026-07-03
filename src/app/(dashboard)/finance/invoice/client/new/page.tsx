'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useNewClientInvoiceForm } from '@/hooks/client-invoices/useNewClientInvoiceForm';
import { InvoiceDetailsFields } from '@/components/finance/client-invoices/InvoiceDetailsFields';
import { LineItemsEditor } from '@/components/finance/client-invoices/LineItemsEditor';

const inputClass =
  'w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm';

export default function NewClientInvoicePage() {
  const router = useRouter();
  const {
    notesRef, sites, sitesLoading, isLoading, error, today,
    form, updateField, items, updateItem, addItem, removeItem,
    getLineTotal, grandTotal, handleSubmit,
  } = useNewClientInvoiceForm();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

        <InvoiceDetailsFields
          form={form}
          onChange={updateField}
          sites={sites}
          sitesLoading={sitesLoading}
          today={today}
          notesRef={notesRef}
          inputClass={inputClass}
        />

        <LineItemsEditor
          items={items}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          getLineTotal={getLineTotal}
          grandTotal={grandTotal}
          inputClass={inputClass}
        />

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