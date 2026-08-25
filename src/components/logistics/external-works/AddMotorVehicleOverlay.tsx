'use client';

import { useEffect, useState } from 'react';
import { X, Truck, Loader2 } from 'lucide-react';
import { AddMotorVehicleForm, emptyMotorVehicleForm } from '@/types/external-work';

interface AddMotorVehicleOverlayProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: AddMotorVehicleForm) => void;
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

export default function AddMotorVehicleOverlay({ open, onClose, onSubmit }: AddMotorVehicleOverlayProps) {
  const [form, setForm] = useState<AddMotorVehicleForm>(emptyMotorVehicleForm());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(emptyMotorVehicleForm());
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle.trim()) return setError('Vehicle is required.');
    if (!form.destination.trim()) return setError('Destination is required.');
    if (!form.clientName.trim()) return setError('Client name is required.');

    setSubmitting(true);
    setError(null);
    onSubmit(form);
    setSubmitting(false);
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
                <h2 className="text-base font-semibold text-[color:var(--foreground)]">Add Motor Vehicle Delivery</h2>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Log an external delivery for a client</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <Field label="Vehicle" required>
              <input className={inputCls} placeholder="e.g. Tipper Truck — KDB 221A" value={form.vehicle}
                onChange={(e) => setForm((p) => ({ ...p, vehicle: e.target.value }))} />
            </Field>
            <Field label="Material">
              <input className={inputCls} placeholder="e.g. Building Sand" value={form.material}
                onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))} />
            </Field>
            <Field label="Quantity">
              <input className={inputCls} placeholder="e.g. 20 tonnes" value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
            </Field>
            <Field label="Pickup Point">
              <input className={inputCls} placeholder="e.g. Machakos Quarry" value={form.pickupPoint}
                onChange={(e) => setForm((p) => ({ ...p, pickupPoint: e.target.value }))} />
            </Field>
            <Field label="Destination" required>
              <input className={inputCls} placeholder="e.g. Athi River Site" value={form.destination}
                onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} />
            </Field>
            <Field label="Amount">
              <input className={inputCls} placeholder="e.g. KES 45,000" value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            </Field>
            <Field label="Client Name" required>
              <input className={inputCls} placeholder="Client full name" value={form.clientName}
                onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))} />
            </Field>
            <Field label="Client Phone No.">
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
                {submitting ? 'Saving…' : 'Add Delivery'}
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