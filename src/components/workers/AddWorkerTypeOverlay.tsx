'use client';
import { useState, useEffect } from 'react';
import { Wallet, X, Loader2 } from 'lucide-react';
import { SkillType } from '@/types/worker-dashboard';
import { DarkSelect } from '@/components/shared/DarkSelect';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-[color:var(--muted)] border border-[color:var(--border)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] transition-colors';

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={inputCls} />; }

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
      {loading && <Loader2 size={15} className="animate-spin" />}{loading ? 'Saving…' : label}
    </button>
  );
}

interface AddWorkerTypeOverlayProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; amount: number; skill: SkillType }) => Promise<unknown>;
}

export function AddWorkerTypeOverlay({ open, onClose, onSubmit }: AddWorkerTypeOverlayProps) {
  const [form, setForm] = useState({ name: '', amount: '', skill: SkillType.SKILLED as SkillType });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ name: '', amount: '', skill: SkillType.SKILLED });
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Worker type name is required.');
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum < 0) return setError('Enter a valid amount.');
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name: form.name.trim(), amount: amountNum, skill: form.skill });
      onClose();
    } catch (err: unknown) {
      console.error('Worker type creation failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to create worker type';
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-hidden={!open}>
        <div onClick={e => e.stopPropagation()}
          className={`flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl gv-glass-bg border border-border shadow-2xl transition-all duration-300 ease-out ${open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'}`}>
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><span className="text-primary"><Wallet size={18} /></span></div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Add Worker Type</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Define a new worker type and its rate</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Worker Type Name" required>
                <TextInput placeholder="e.g. Mason, Casual Laborer" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field label="Skill" required>
                <DarkSelect value={form.skill} onChange={e => setForm(p => ({ ...p, skill: e.target.value as SkillType }))}>
                  <option value={SkillType.SKILLED}>Skilled</option>
                  <option value={SkillType.UNSKILLED}>Unskilled</option>
                </DarkSelect>
              </Field>
              <Field label="Amount (per day)" required>
                <TextInput type="number" min="0" step="1" placeholder="e.g. 1500" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </Field>
              {error && <p className="text-xs text-destructive bg-(--destructive)/10 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex flex-col gap-2 pt-2">
                <SubmitBtn loading={loading} label="Create Worker Type" />
                <button type="button" onClick={onClose} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}