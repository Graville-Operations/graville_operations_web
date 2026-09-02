'use client';

import { useEffect, useState } from 'react';
import { X, Truck, Loader2 } from 'lucide-react';
import { DarkSelect } from '@/components/shared/DarkSelect';
import {
  InitiateDeliveryForm,
  emptyInitiateDeliveryForm,
  DRIVER_TASK_TYPE_LABELS,
} from '@/types/driver-task';
import { DriverTaskType } from '@/types/enums/driver-task';
import { ModeOfTransport } from '@/types/transport';
import { MaterialItem, ToolItem } from '@/types/store';
import type { TransferBrief } from '@/types/driver-task';

interface Site { id: number; name: string; }

interface InitiateDeliveryOverlayProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: InitiateDeliveryForm) => void | Promise<void>;
  sites: Site[];
  transportOptions: ModeOfTransport[];
  transferOptions: TransferBrief[];
  materialsBySite: Record<number, MaterialItem[]>;
  toolsBySite: Record<number, ToolItem[]>;
  loadMaterialsForSite: (siteId: number) => void;
  loadToolsForSite: (siteId: number) => void;
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

export default function InitiateDeliveryOverlay({
  open, onClose, onSubmit,
  sites, transportOptions, transferOptions,
  materialsBySite, toolsBySite, loadMaterialsForSite, loadToolsForSite,
}: InitiateDeliveryOverlayProps) {
  const [form, setForm] = useState<InitiateDeliveryForm>(emptyInitiateDeliveryForm());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyInitiateDeliveryForm());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  const siteId = form.siteId ? Number(form.siteId) : null;
  const materials = siteId ? materialsBySite[siteId] ?? [] : [];
  const tools = siteId ? toolsBySite[siteId] ?? [] : [];

  const handleSiteChange = (value: string) => {
    setForm((p) => ({ ...p, siteId: value }));
    const id = Number(value);
    if (id) {
      loadMaterialsForSite(id);
      loadToolsForSite(id);
    }
  };

  const updateMaterial = (patch: Partial<{ materialId: string; quantity: string }>) =>
    setForm((p) => ({ ...p, items: [{ ...p.items[0], ...patch }] }));

  const updateTool = (patch: Partial<{ toolId: string; quantity: string }>) =>
    setForm((p) => ({ ...p, toolItems: [{ ...p.toolItems[0], ...patch }] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[InitiateDeliveryOverlay] submit clicked, form:', form);

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      console.error('[InitiateDeliveryOverlay] onSubmit threw:', err);
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
          className={`flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl gv-glass-bg border border-[color:var(--border)] shadow-2xl transition-all duration-300 ease-out ${open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'}`}
        >
          <div className="flex items-start justify-between p-6 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><Truck size={18} className="text-[color:var(--primary)]" /></div>
              <div>
                <h2 className="text-base font-semibold text-[color:var(--foreground)]">Create Driver Task</h2>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Log a new internal material movement</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <Field label="Task Type" required>
              <DarkSelect
                value={form.taskType}
                onChange={(e) => setForm((p) => ({ ...p, taskType: e.target.value as DriverTaskType }))}
              >
                {Object.values(DriverTaskType).map((t) => (
                  <option key={t} value={t}>{DRIVER_TASK_TYPE_LABELS[t]}</option>
                ))}
              </DarkSelect>
            </Field>

            <Field label="Title" required>
              <input
                className={inputCls}
                placeholder="e.g. Cement transfer to Kware Primary Site"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </Field>

            <Field label="Mode of Transport">
              <DarkSelect
                value={form.transportId}
                onChange={(e) => setForm((p) => ({ ...p, transportId: e.target.value }))}
              >
                <option value="">Unassigned — assign later</option>
                {transportOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {t.number_plate}</option>
                ))}
              </DarkSelect>
            </Field>

            <Field label="Site">
              <DarkSelect value={form.siteId} onChange={(e) => handleSiteChange(e.target.value)}>
                <option value="">Select destination site…</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </DarkSelect>
            </Field>

            {form.taskType === DriverTaskType.TRANSFER && (
              <Field label="Material Transfer" required>
                <DarkSelect
                  value={form.materialTransferId}
                  onChange={(e) => setForm((p) => ({ ...p, materialTransferId: e.target.value }))}
                >
                  <option value="">Select transfer…</option>
                  {transferOptions.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      #{tr.id} — {tr.pick_up_point} → {tr.drop_off_point} ({tr.status})
                    </option>
                  ))}
                </DarkSelect>
              </Field>
            )}

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[color:var(--foreground)] uppercase tracking-wider">Material</span>
              <DarkSelect value={form.items[0]?.materialId ?? ''} onChange={(e) => updateMaterial({ materialId: e.target.value })}>
                <option value="">{siteId ? 'Select material…' : 'Select a site first'}</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </DarkSelect>
              <input
                className={inputCls}
                type="number"
                min="0"
                placeholder="Qty"
                value={form.items[0]?.quantity ?? ''}
                onChange={(e) => updateMaterial({ quantity: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[color:var(--foreground)] uppercase tracking-wider">Tool</span>
              <DarkSelect value={form.toolItems[0]?.toolId ?? ''} onChange={(e) => updateTool({ toolId: e.target.value })}>
                <option value="">{siteId ? 'Select tool…' : 'Select a site first'}</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </DarkSelect>
              <input
                className={inputCls}
                type="number"
                min="0"
                placeholder="Qty"
                value={form.toolItems[0]?.quantity ?? ''}
                onChange={(e) => updateTool({ quantity: e.target.value })}
              />
            </div>

            <Field label="Notes">
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Optional notes…"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </Field>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Saving…' : 'Create Task'}
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