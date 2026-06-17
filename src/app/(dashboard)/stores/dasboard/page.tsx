'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Package, Wrench, ShoppingCart, AlertTriangle,
  ArrowLeftRight, Plus, BarChart3, X, Loader2,
  Ruler,
} from 'lucide-react';
import api from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const BILLING_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY', 'FIXED'] as const;
type BillingType = typeof BILLING_TYPES[number];

const DUMMY = {
  total_orders:    47,
  sites_low_stock: [
    { id: 1, name: 'Mishi Mboko',    low_count: 4 },
    { id: 2, name: 'Kware Primary',  low_count: 2 },
    { id: 3, name: 'Huruma',         low_count: 1 },
  ],
  total_materials:  312,
  total_tools:       88,
  total_transfers:    9,
  damaged_tools:      5,
  total_hire_cost: 485_000,
};

function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function extractList(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.items)) return raw.data.items;
  return [];
}

type Variant = 'default' | 'warn' | 'danger' | 'success' | 'info';

const BORDER_CLS: Record<Variant, string> = {
  default: 'border-[color:var(--border)]', warn: 'border-[color:var(--gv-border-warn)]',
  danger: 'border-[color:var(--gv-border-danger)]', success: 'border-[color:var(--gv-border-success)]',
  info: 'border-[color:var(--gv-border-info)]',
};

const ICON_CLS: Record<Variant, string> = {
  default: 'text-[color:var(--primary)]', warn: 'text-[color:var(--gv-text-warn)]',
  danger: 'text-[color:var(--destructive)]', success: 'text-[color:var(--gv-text-success)]',
  info: 'text-[color:var(--gv-text-info)]',
};

const VAL_CLS: Record<Variant, string> = {
  default: 'text-[color:var(--foreground)]', warn: 'text-[color:var(--gv-text-warn)]',
  danger: 'text-[color:var(--destructive)]', success: 'text-[color:var(--gv-text-success)]',
  info: 'text-[color:var(--gv-text-info)]',
};

interface StatCardProps { label: string; value: string | number; sub?: string; icon: React.ReactNode; variant?: Variant; badge?: string; }
function StatCard({ label, value, sub, icon, variant = 'default', badge }: StatCardProps) {
  return (
    <div className={`gv-card flex flex-col gap-4 ${BORDER_CLS[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="gv-icon-box"><span className={ICON_CLS[variant]}>{icon}</span></div>
        <div className="flex items-center gap-2">{badge && <span className="gv-tag text-[color:var(--gv-text-subtle)]">{badge}</span>}</div>
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className={`text-3xl font-bold tracking-tight ${VAL_CLS[variant]}`}>{value}</p>
        {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function LowStockCard({ sites }: { sites: typeof DUMMY.sites_low_stock }) {
  return (
    <div className={`gv-card flex flex-row gap-4 ${BORDER_CLS.default}`}>
      <div className="flex flex-col gap-4 shrink-0">
        <div className="gv-icon-box"><span className={ICON_CLS.default}><AlertTriangle size={18} /></span></div>
        <div>
          <p className="gv-label whitespace-nowrap">Sites with Low Stock</p>
          <p className={`text-3xl font-bold tracking-tight ${VAL_CLS.default}`}>{sites.length}</p>
        </div>
      </div>
      {sites.length > 0 && (
        <ul className="flex flex-col justify-center gap-1.5 pl-4 border-l border-[color:var(--border)] min-w-0">
          {sites.map(s => (
            <li key={s.id} className="flex items-center gap-3 text-xs">
              <span className="text-[color:var(--foreground)] truncate flex-1">{s.name}</span>
              <span className="gv-tag shrink-0 text-[color:var(--muted-foreground)]">{s.low_count} item{s.low_count !== 1 ? 's' : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ActionBtnProps { label: string; icon: React.ReactNode; onClick: () => void; variant?: 'primary' | 'secondary'; }
function ActionBtn({ label, icon, onClick, variant = 'primary' }: ActionBtnProps) {
  const base = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] cursor-pointer';
  const cls = variant === 'primary' ? `${base} bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90` : `${base} gv-glass-bg gv-glass-border text-[color:var(--foreground)] hover:bg-[color:var(--muted)]`;
  return <button onClick={onClick} className={cls}>{icon}{label}</button>;
}

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

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-[color:var(--muted)] border border-[color:var(--border)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] transition-colors';
const selectCls = 'w-full appearance-none px-3 py-2 pr-9 rounded-lg text-sm bg-[color:var(--gv-glass-bg)] border border-[color:var(--border)] text-[color:var(--foreground)] cursor-pointer outline-none transition-colors focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] hover:border-[color:var(--gv-glass-border)] [&>option]:bg-[#0d1528] [&>option]:text-white';

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={inputCls} />; }
function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input type="number" {...props} className={inputCls} />; }
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} rows={3} className={`${inputCls} resize-none`} />; }

function DarkSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div className="relative">
      <select {...props} className={selectCls}>{props.children}</select>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--gv-text-subtle)] pointer-events-none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  elevated?: boolean;
  dimmed?: boolean;
}
function Overlay({ open, onClose, title, subtitle, icon, children, elevated = false, dimmed = false }: OverlayProps) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [open, onClose]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const backdropZ = elevated ? 'z-[60]' : 'z-40';
  const contentZ = elevated ? 'z-[70]' : 'z-50';

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 ${backdropZ} bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      <div className={`fixed inset-0 ${contentZ} flex items-center justify-center p-4 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-hidden={!open}>
        <div
          onClick={e => e.stopPropagation()}
          className={`flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl gv-glass-bg border border-[color:var(--border)] shadow-2xl transition-all duration-300 ease-out
            ${open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'}
            ${dimmed ? 'opacity-40 scale-[0.96] pointer-events-none' : ''}`}
        >
          <div className="flex items-start justify-between p-6 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><span className="text-[color:var(--primary)]">{icon}</span></div>
              <div><h2 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h2>{subtitle && <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">{subtitle}</p>}</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors cursor-pointer"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
      {loading && <Loader2 size={15} className="animate-spin" />}{loading ? 'Saving…' : label}
    </button>
  );
}

type ToastType = 'success' | 'error';
interface ToastState { message: string; type: ToastType; id: number; }
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [toast.id, onDismiss]);
  return (
    <div className={`fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${toast.type === 'success' ? 'bg-[color:var(--gv-glass-bg,#1a1a2e)] border-[color:var(--gv-border-success)] text-[color:var(--gv-text-success)]' : 'bg-[color:var(--gv-glass-bg,#1a1a2e)] border-[color:var(--gv-border-danger)] text-[color:var(--destructive)]'}`}>
      {toast.message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 cursor-pointer"><X size={13} /></button>
    </div>
  );
}

interface AddUnitOverlayProps { open: boolean; onClose: () => void; onSuccess?: (unit: any) => void; elevated?: boolean; }
function AddUnitOverlay({ open, onClose, onSuccess, elevated = false }: AddUnitOverlayProps) {
  const [form, setForm] = useState({ name: '', symbol: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => { setForm({ name: '', symbol: '', description: '' }); setError(null); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Unit name is required.');
    setLoading(true); setError(null);
    try {
      const res = await api.post('/materials/unit/create', {
        name: form.name.trim(),
        symbol: form.symbol.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      console.log('[AddUnit] create response:', res.data);
      onSuccess?.(res.data?.data ?? res.data);
      handleClose();
    } catch (err: any) {
      console.error('Unit creation failed:', err);
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to create unit');
    } finally { setLoading(false); }
  };

  return (
    <Overlay open={open} onClose={handleClose} title="Add Material Unit" subtitle="Define a measurement unit used when creating materials" icon={<Ruler size={18} />} elevated={elevated}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Unit Name" required><TextInput placeholder="e.g. Kilogram, Litre, Bag" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} /></Field>
        <Field label="Symbol"><TextInput placeholder="e.g. kg, L, bag" value={form.symbol} onChange={e => setForm(p => ({...p, symbol: e.target.value}))} /></Field>
        <Field label="Description"><Textarea placeholder="Optional notes about this unit…" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} /></Field>
        {error && <p className="text-xs text-[color:var(--destructive)] bg-[color:var(--destructive)]/10 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex flex-col gap-2 pt-2">
          <SubmitBtn loading={loading} label="Create Unit" />
          <button type="button" onClick={handleClose} className="w-full py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer">Cancel</button>
        </div>
      </form>
    </Overlay>
  );
}

interface Unit { id: number; name: string; symbol: string; }
interface AddMaterialOverlayProps { open: boolean; onClose: () => void; onSuccess?: () => void; }

function AddMaterialOverlay({ open, onClose, onSuccess }: AddMaterialOverlayProps) {
  const [form, setForm] = useState({ name: '', description: '', unit_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addUnitOpen, setAddUnitOpen] = useState(false);

  const unitsApi = useApi('/materials/unit/all', { params: { limit: 100, skip: 0 }, enabled: open });
  const units = extractList(unitsApi.data) as Unit[];
  const unitsLoading = unitsApi.loading;

  const handleClose = () => { setForm({ name: '', description: '', unit_id: '' }); setError(null); onClose(); };

  const handleUnitCreated = (unit: Unit) => {
    unitsApi.refetch();
    setForm(p => ({ ...p, unit_id: String(unit.id) }));
    setAddUnitOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Material name is required.');
    if (!form.unit_id) return setError('Please select a unit.');
    setLoading(true); setError(null);
    try {
      const res = await api.post('/materials/material/add', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        unit_id: Number(form.unit_id),
      });
      console.log('[AddMaterial] create response:', res.data);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Material creation failed:', err);
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to create material');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Overlay open={open} onClose={handleClose} title="Add Material" subtitle="Register a new material in the company catalogue" icon={<Package size={18} />} dimmed={addUnitOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Material Name" required><TextInput placeholder="e.g. Portland Cement" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} /></Field>
          <Field label="Description"><Textarea placeholder="Optional description…" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} /></Field>

          <Field label="Unit" required>
            <div className="flex gap-2">
              <div className="flex-1">
                {unitsLoading ? <div className={`${inputCls} flex items-center gap-2 text-[color:var(--muted-foreground)]`}><Loader2 size={14} className="animate-spin" /> Loading units…</div> : (
                  <DarkSelect value={form.unit_id} onChange={e => setForm(p => ({...p, unit_id: e.target.value}))}>
                    <option value="">Select unit…</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</option>)}
                  </DarkSelect>
                )}
              </div>
              <button type="button" onClick={() => setAddUnitOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 transition-all cursor-pointer whitespace-nowrap">
                <Plus size={13} /> New Unit
              </button>
            </div>
          </Field>

          {error && <p className="text-xs text-[color:var(--destructive)] bg-[color:var(--destructive)]/10 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex flex-col gap-2 pt-2">
            <SubmitBtn loading={loading} label="Create Material" />
            <button type="button" onClick={handleClose} className="w-full py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer">Cancel</button>
          </div>
        </form>
      </Overlay>
      <AddUnitOverlay open={addUnitOpen} onClose={() => setAddUnitOpen(false)} onSuccess={handleUnitCreated} elevated />
    </>
  );
}

interface AddToolOverlayProps { open: boolean; onClose: () => void; onSuccess?: () => void; }
function AddToolOverlay({ open, onClose, onSuccess }: AddToolOverlayProps) {
  const [form, setForm] = useState({
    name: '', description: '', isCompanyTool: 'true', billingType: 'DAILY' as BillingType,
    quantity: '1', vendor: '', hire_cost: '', hire_start_date: '', hire_end_date: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => { 
    setForm({ name: '', description: '', isCompanyTool: 'true', billingType: 'DAILY', quantity: '1', vendor: '', hire_cost: '', hire_start_date: '', hire_end_date: '', notes: '' }); 
    setError(null); onClose(); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Tool name is required.');
    setLoading(true); setError(null);
    try {
      const isCompanyTool = form.isCompanyTool === 'true';

      const payload: Record<string, any> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        is_company_tool: isCompanyTool,
        quantity: Number(form.quantity) || 1,
      };

      if (!isCompanyTool) {
        payload.billing_type = form.billingType;
        payload.vendor = form.vendor.trim() || undefined;
        payload.hire_cost = form.hire_cost ? Number(form.hire_cost) : undefined;
        payload.hire_start_date = form.hire_start_date || undefined;
        payload.hire_end_date = form.hire_end_date || undefined;
      }
      if (form.notes.trim()) payload.notes = form.notes.trim();

      const res = await api.post('/materials/tool/add', payload);
      console.log('[AddTool] create response:', res.data);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Tool creation failed:', err);
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to create tool');
    } finally { setLoading(false); }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) => setForm(p => ({...p, [k]: e.target.value}));

  return (
    <Overlay open={open} onClose={handleClose} title="Add Tool" subtitle="Register a new tool in the company catalogue" icon={<Wrench size={18} />}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <p className="gv-eyebrow mb-3">Tool Details</p>
          <div className="flex flex-col gap-4">
            <Field label="Tool Name" required><TextInput placeholder="e.g. Concrete Mixer" value={form.name} onChange={set('name')} /></Field>
            <Field label="Description"><Textarea placeholder="Optional description…" value={form.description} onChange={set('description')} /></Field>
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]" />

        <div>
          <p className="gv-eyebrow mb-3">Hire & Receipt</p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ownership">
                <DarkSelect value={form.isCompanyTool} onChange={set('isCompanyTool')}>
                  <option value="true">Company-owned</option>
                  <option value="false">Hired / External</option>
                </DarkSelect>
              </Field>
              <Field label="Billing Type">
                <DarkSelect value={form.billingType} onChange={set('billingType')}>
                  {BILLING_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </DarkSelect>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity"><NumberInput min={1} step={1} value={form.quantity} onChange={set('quantity')} /></Field>
              <Field label="Hire Cost (KES)"><NumberInput min={0} step="any" placeholder="0.00" value={form.hire_cost} onChange={set('hire_cost')} /></Field>
            </div>
            <Field label="Vendor"><TextInput placeholder="Supplier / hire company name" value={form.vendor} onChange={set('vendor')} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hire Start"><TextInput type="date" value={form.hire_start_date} onChange={set('hire_start_date')} /></Field>
              <Field label="Hire End"><TextInput type="date" value={form.hire_end_date} onChange={set('hire_end_date')} /></Field>
            </div>
            <Field label="Notes"><Textarea placeholder="Any additional notes…" value={form.notes} onChange={set('notes')} /></Field>
          </div>
        </div>

        {error && <p className="text-xs text-[color:var(--destructive)] bg-[color:var(--destructive)]/10 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex flex-col gap-2 pt-2">
          <SubmitBtn loading={loading} label="Create Tool" />
          <button type="button" onClick={handleClose} className="w-full py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer">Cancel</button>
        </div>
      </form>
    </Overlay>
  );
}

type OverlayKey = 'material' | 'tool' | 'unit' | null;

export default function StoreDashboardPage() {
  const d = DUMMY;
  const [activeOverlay, setActiveOverlay] = useState<OverlayKey>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, id: ++toastId.current });
  }, []);

  const cards = useMemo(() => [
    { key: 'orders', label: 'Total Orders', value: d.total_orders, sub: 'Across all sites', icon: <ShoppingCart size={18} /> },
    { key: 'materials', label: 'Total Materials', value: d.total_materials, sub: 'Company-wide catalogue items', icon: <Package size={18} /> },
    { key: 'tools', label: 'Total Tools', value: d.total_tools, sub: 'All sites combined', icon: <Wrench size={18} /> },
    { key: 'transfers', label: 'Total Transfers', value: d.total_transfers, sub: 'Material transfers today', icon: <ArrowLeftRight size={18} />, badge: 'Today' },
    { key: 'damaged', label: 'Damaged Tools', value: d.damaged_tools, sub: 'Tools marked as damaged', icon: <Wrench size={18} /> },
    { key: 'hire_cost', label: 'Total Hire Cost', value: fmtKES(d.total_hire_cost), sub: 'Active tool hire across all sites', icon: <BarChart3 size={18} /> },
  ], [d]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="gv-eyebrow">Store</p>
            <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ActionBtn label="Add Unit" icon={<Plus size={15} />} variant="primary" onClick={() => setActiveOverlay('unit')} />
            <ActionBtn label="Add Material" icon={<Plus size={15} />} onClick={() => setActiveOverlay('material')} />
            <ActionBtn label="Add Tool" icon={<Plus size={15} />} onClick={() => setActiveOverlay('tool')} />
          </div>
        </div>

        <p className="text-lg text-[color:var(--muted-foreground)]">Company's wide overview of all figures aggregate across every active site.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.slice(0, 1).map(({ key, ...c }) => <StatCard key={key} {...c} />)}
          <LowStockCard sites={d.sites_low_stock} />
          {cards.slice(1).map(({ key, ...c }) => <StatCard key={key} {...c} />)}
        </div>
      </div>

      <AddUnitOverlay open={activeOverlay === 'unit'} onClose={() => setActiveOverlay(null)} onSuccess={() => showToast('Unit created successfully.', 'success')} />
      <AddMaterialOverlay open={activeOverlay === 'material'} onClose={() => setActiveOverlay(null)} onSuccess={() => showToast('Material created successfully.', 'success')} />
      <AddToolOverlay open={activeOverlay === 'tool'} onClose={() => setActiveOverlay(null)} onSuccess={() => showToast('Tool created successfully.', 'success')} />

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}