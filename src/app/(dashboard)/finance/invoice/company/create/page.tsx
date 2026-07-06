'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCreateCompanyInvoiceForm } from '@/hooks/company-invoices/useCreateCompanyInvoiceForm';
import CompanyInvoiceDetailsForm from '@/components/finance/company/CompanyInvoiceDetailsForm';
import CompanyInvoiceLineItemsEditor from '@/components/finance/company/CompanyInvoiceLineItemsEditor';
import CompanyInvoiceFormFooter from '@/components/finance/company/CompanyInvoiceFormFooter';

export default function CreateCompanyInvoicePage() {
  const router = useRouter();
  const {
    form,
    updateField,
    items,
    updateItem,
    addItem,
    removeItem,
    totalAmount,
    submitting,
    error,
    handleSubmit,
    cancel,
  } = useCreateCompanyInvoiceForm();

  return (
    <div className="space-y-5 w-full" style={{ maxWidth: '860px', margin: '0 auto' }}>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl"
          style={{
            background: 'var(--gv-glass-bg)',
            border: '1px solid var(--gv-glass-border)',
            color: 'var(--gv-text-muted)',
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>New Company Invoice</h2>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>Fill in the details below</p>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
        >
          {error}
        </div>
      )}

      <CompanyInvoiceDetailsForm
        invoiceNumber={form.invoice_number}
        invoiceDate={form.invoice_date}
        notes={form.notes}
        onChange={updateField}
      />

      <CompanyInvoiceLineItemsEditor
        items={items}
        onUpdateItem={updateItem}
        onAddItem={addItem}
        onRemoveItem={removeItem}
      />

      <CompanyInvoiceFormFooter
        totalAmount={totalAmount}
        submitting={submitting}
        onCancel={cancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}