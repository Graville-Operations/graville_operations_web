'use client';

interface CompanyInvoiceDetailsFormProps {
  invoiceNumber: string;
  invoiceDate: string;
  notes: string;
  onChange: (field: 'invoice_number' | 'invoice_date' | 'notes', value: string) => void;
}

export default function CompanyInvoiceDetailsForm({
  invoiceNumber,
  invoiceDate,
  notes,
  onChange,
}: CompanyInvoiceDetailsFormProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="gv-card">
      <p className="gv-eyebrow text-label-sm mb-4">Invoice Details</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="gv-eyebrow mb-1.5 block">Invoice Number *</label>
          <input
            type="text"
            className="gv-input w-full text-sm"
            placeholder="CINV-001"
            value={invoiceNumber}
            onChange={(e) => onChange('invoice_number', e.target.value)}
          />
        </div>
        <div>
          <label className="gv-eyebrow mb-1.5 block">Invoice Date *</label>
          <input
            type="date"
            className="gv-input w-full text-sm"
            max={today}
            value={invoiceDate}
            onChange={(e) => onChange('invoice_date', e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="gv-eyebrow mb-1.5 block">Notes</label>
          <textarea
            className="gv-input w-full text-sm resize-none"
            rows={3}
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}