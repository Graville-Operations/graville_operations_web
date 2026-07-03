import { RefObject } from 'react';
import { Site } from '@/types';
import { NewClientInvoiceForm } from '@/types/client-invoice';

interface InvoiceDetailsFieldsProps {
  form: NewClientInvoiceForm;
  onChange: (key: keyof NewClientInvoiceForm, value: string) => void;
  sites: Site[];
  sitesLoading: boolean;
  today: string;
  notesRef: RefObject<HTMLTextAreaElement | null>;
  inputClass: string;
}

export function InvoiceDetailsFields({ form, onChange, sites, sitesLoading, today, notesRef, inputClass }: InvoiceDetailsFieldsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-white mb-2">Invoice Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
            Invoice Number *
          </label>
          <input
            type="text"
            value={form.invoice_number}
            onChange={(e) => onChange('invoice_number', e.target.value)}
            placeholder="e.g. CI-2024-001"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
            Invoice Date *
          </label>
          <input
            type="date"
            value={form.invoice_date}
            onChange={(e) => onChange('invoice_date', e.target.value)}
            required
            max={today}
            className={inputClass}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
            Client Name *
          </label>
          <input
            type="text"
            value={form.client_name}
            onChange={(e) => onChange('client_name', e.target.value)}
            placeholder="e.g. Acme Corporation"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
            Site *
          </label>
          <select
            value={form.site_id}
            onChange={(e) => onChange('site_id', e.target.value)}
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

      <div>
        <label className="block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide">
          Notes
        </label>
        <textarea
          ref={notesRef}
          value={form.notes}
          onChange={(e) => {
            onChange('notes', e.target.value);
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
  );
}