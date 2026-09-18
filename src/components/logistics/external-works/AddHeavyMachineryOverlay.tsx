'use client';

import { useEffect, useState } from 'react';
import { X, Truck, Loader2 } from 'lucide-react';
import { DarkSelect } from '@/components/shared/DarkSelect';
import { AddHeavyMachineryForm, emptyHeavyMachineryForm, BILLING_METHOD_OPTIONS, BillingMethod } from '@/types/external-work';
import { ModeOfTransport } from '@/types/transport';

interface AddHeavyMachineryOverlayProps {
  open: boolean;
  transports: ModeOfTransport[]; // pre-filtered to heavy-machinery vehicles by the page
  onClose: () => void;
  onSubmit: (form: AddHeavyMachineryForm) => Promise<void>;
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-[color:var(--muted)] border border-[color:var(--border)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] transition-colors';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">
        {label}{required && <span className="text-[color:var(--destructive)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AddHeavyMachineryOverlay({ open, transports, onClose, onSubmit }: AddHeavyMachineryOverlayProps) {
  const [form, setForm] = useState<AddHeavyMachineryForm>(emptyHeavyMachineryForm());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(emptyHeavyMachineryForm());
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.transportId) return setError('Vehicle is required.');
    if (!form.location.trim()) return setError('Location is required.');
    if (!form.service.trim()) return setError('Service is required.');
    if (!form.billingMethod) return setError('Billing method is required.');
    if (!form.duration.trim()) return setError('Duration is required.');
    if (!form.unitAmount.trim()) return setError('Unit amount is required.');
    if (!form.clientName.trim()) return setError('Client name is required.');
    if (!form.clientPhone.trim()) return setError('Client phone is required.');

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl gv-glass-bg border border-[color:var(--border)] shadow-2xl transition-all duration-300 ease-out ${open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'}`}
        >
          <div className="flex items-start justify-between p-6 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><Truck size={18} className="text-[color:var(--primary)]" /></div>
              <div>
                <h2 className="text-base font-semibold text-[color:var(--foreground)]">Add Heavy Machinery Service</h2>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Log an external machinery service for a client</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <Field label="Vehicle" required>
              <DarkSelect value={form.transportId} onChange={(e) => setForm((p) => ({ ...p, transportId: e.target.value }))}>
                <option value="">Select vehicle…</option>
                {transports.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {t.number_plate}</option>
                ))}
              </DarkSelect>
              {transports.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>
                  No heavy machinery vehicles found. Mark one as heavy machinery under Transport first.
                </p>
              )}
            </Field>
            <Field label="Location" required>
              <input className={inputCls} placeholder="e.g. Athi River Site" value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            </Field>
            <Field label="Service" required>
              <input className={inputCls} placeholder="e.g. Foundation excavation" value={form.service}
                onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))} />
            </Field>
            <Field label="Billing Method" required>
              <DarkSelect value={form.billingMethod} onChange={(e) => setForm((p) => ({ ...p, billingMethod: e.target.value as BillingMethod }))}>
                <option value="">Select billing method…</option>
                {BILLING_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </DarkSelect>
            </Field>
            <Field label="Duration" required>
              <input type="number" min="0" step="any" className={inputCls} placeholder="e.g. 8" value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
            </Field>
            <Field label="Unit Amount" required>
              <input className={inputCls} placeholder="e.g. KES 5,000" value={form.unitAmount}
                onChange={(e) => setForm((p) => ({ ...p, unitAmount: e.target.value }))} />
            </Field>
            <Field label="Total Amount">
              <input className={inputCls} placeholder="Auto-calculated if left blank" value={form.totalAmount}
                onChange={(e) => setForm((p) => ({ ...p, totalAmount: e.target.value }))} />
            </Field>
            <Field label="Client Name" required>
              <input className={inputCls} placeholder="Client full name" value={form.clientName}
                onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))} />
            </Field>
            <Field label="Client Phone No." required>
              <input className={inputCls} placeholder="e.g. 0712 345 678" value={form.clientPhone}
                onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))} />
            </Field>

            {error && <p className="text-xs text-[color:var(--destructive)] bg-[color:var(--destructive)]/10 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Saving…' : 'Add Service'}
              </button>
              <button type="button" onClick={onClose} className="w-full py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}