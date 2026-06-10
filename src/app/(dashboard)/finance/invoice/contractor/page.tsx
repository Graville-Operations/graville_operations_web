'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '@/lib/api';
import {
  Receipt, Search, X, ChevronLeft, Plus, ChevronDown,
  StickyNote, Trash2, AlertCircle,
} from 'lucide-react';


interface LineItem {
  id: number;
  index: number;
  particulars: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface BriefUserInfo {
  name: string;
  email: string;
  phone: string;
}

interface SubcontractorInvoiceListItem {
  id: number;
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;
  total: number;
  createdAt: string;
  createdBy?: BriefUserInfo;
}

interface SubcontractorInvoiceDetail {
  id: number;
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;
  notes: string | null;
  createdBy: BriefUserInfo;
  total: number;
  created_at: string;
  items: LineItem[];
}

interface SiteOption {
  id: number;
  name: string;
}


interface NewLineItem {
  particulars: string;
  quantity: string;
  unitPrice: string;
}

interface NewInvoiceForm {
  invoiceNo: string;
  contractorName: string;
  invoiceDate: string;   
  notes: string;
  items: NewLineItem[];
}

const emptyItem = (): NewLineItem => ({ particulars: '', quantity: '', unitPrice: '' });

const defaultForm = (): NewInvoiceForm => ({
  invoiceNo: '',
  contractorName: '',
  invoiceDate: '',
  notes: '',
  items: [emptyItem()],
});

const fmtKes = (n: number) =>
  n?.toLocaleString('en-KE', { minimumFractionDigits: 0 });


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <div className="text-sm text-white">{children}</div>
    </div>
  );
}


const inputCls =
  'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white ' +
  'placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] [color-scheme:dark]';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1';


function NewInvoiceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<NewInvoiceForm>(defaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const setField = <K extends keyof NewInvoiceForm>(key: K, value: NewInvoiceForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setItem = (idx: number, key: keyof NewLineItem, value: string) =>
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...f, items };
    });

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (idx: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const grandTotal = form.items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async () => {
    setError(null);

    if (!form.invoiceNo.trim())      return setError('Invoice number is required.');
    if (!form.contractorName.trim()) return setError('Contractor name is required.');
    if (!form.invoiceDate)           return setError('Invoice date is required.');
    if (form.items.some((it) => !it.particulars.trim() || !it.quantity || !it.unitPrice))
      return setError('All line item fields are required.');

    const payload = {
      invoiceNo: form.invoiceNo.trim(),
      contractorName: form.contractorName.trim(),
      invoiceDate: form.invoiceDate,
      notes: form.notes.trim() || null,
      items: form.items.map((it, i) => ({
        index: i + 1,
        particulars: it.particulars.trim(),
        quantity: parseFloat(it.quantity),
        unitPrice: parseFloat(it.unitPrice),
        totalAmount: (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0),
      })),
    };

    try {
      setSubmitting(true);
      await api.post('/subcontractor-invoices/create', payload);
      onCreated();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to create invoice. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
   
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f1f2e] border border-white/20 rounded-2xl shadow-2xl">


        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">New Subcontractor Invoice</h2>
            <p className="text-xs text-white/40 mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>


        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">


          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Invoice No. <span className="text-red-400">*</span></label>
              <input
                className={inputCls}
                placeholder="e.g. INV-001"
                value={form.invoiceNo}
                onChange={(e) => setField('invoiceNo', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Invoice Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                className={inputCls}
                value={form.invoiceDate}
                onChange={(e) => setField('invoiceDate', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Contractor Name <span className="text-red-400">*</span></label>
              <input
                className={inputCls}
                placeholder="e.g. Sofa and Son Ltd"
                value={form.contractorName}
                onChange={(e) => setField('contractorName', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Line Items
              </p>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs text-[#33907C] hover:text-[#4db89f] transition-colors font-semibold"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>

            <div className="space-y-2">

              <div className="grid grid-cols-[1fr_80px_90px_32px] gap-2 px-1">
                {['Particulars', 'Qty', 'Unit Price', ''].map((h) => (
                  <p key={h} className="text-xs font-semibold uppercase tracking-wider text-white/30">{h}</p>
                ))}
              </div>

              {form.items.map((item, idx) => {
                const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div key={idx} className="grid grid-cols-[1fr_80px_90px_32px] gap-2 items-center">
                    <input
                      className={inputCls}
                      placeholder="Description"
                      value={item.particulars}
                      onChange={(e) => setItem(idx, 'particulars', e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="1"
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => setItem(idx, 'unitPrice', e.target.value)}
                    />
                    <button
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30
                                 hover:text-red-400 hover:bg-red-400/10 transition-colors
                                 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* Row subtotal hint */}
                    {lineTotal > 0 && (
                      <div className="col-span-4 text-right text-xs text-white/30 -mt-1 pr-10">
                        = KES {fmtKes(lineTotal)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {grandTotal > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="bg-[#33907C]/10 border border-[#33907C]/30 rounded-xl px-5 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">Grand Total</p>
                  <p className="text-xl font-bold text-[#33907C]">KES {fmtKes(grandTotal)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white bg-white/5
                       hover:bg-white/10 transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                       bg-[#33907C] hover:bg-[#2a7566] text-white transition-colors
                       shadow-lg shadow-[#33907C]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus size={15} />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


function DetailPage({
  invoiceId,
  onBack,
}: {
  invoiceId: number;
  onBack: () => void;
}) {
  const [invoice, setInvoice] = useState<SubcontractorInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setInvoice(null);
    try {
      const { data } = await api.get(`/subcontractor-invoices/details/${id}`);
      setInvoice(data?.data ?? data);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDetail(invoiceId); }, [invoiceId, fetchDetail]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack]);

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft size={16} />
          </div>
          <span>Back to Invoices</span>
        </button>

        {invoice && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Invoice {invoice.invoiceNo}</h2>
            <p className="text-sm text-white/40">{invoice.contractorName}</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-40">
          <div className="w-8 h-8 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => fetchDetail(invoiceId)}
            className="text-xs bg-white/10 border border-white/20 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors text-white/70"
          >
            Retry
          </button>
        </div>
      )}

      {invoice && !loading && (
        <>
    
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 pb-3 border-b border-white/10 mb-4">
                Invoice Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-5">
                <Field label="Invoice No.">{invoice.invoiceNo}</Field>
                <Field label="Invoice Date">{invoice.invoiceDate}</Field>
                <Field label="Contractor">{invoice.contractorName}</Field>
                <Field label="Total (KES)">
                  <span className="text-[#33907C] font-bold">{fmtKes(invoice.total)}</span>
                </Field>
                <Field label="Created At">{invoice.created_at}</Field>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
                Submitted By
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#33907C]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#33907C] font-bold text-lg">
                    {invoice.createdBy.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-1 flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">Name</p>
                    <p className="text-sm font-semibold text-white">{invoice.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">Email</p>
                    <p className="text-sm text-blue-400">{invoice.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">Phone</p>
                    <p className="text-sm text-white/60">{invoice.createdBy.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={14} className="text-white/40" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Notes</h3>
              </div>
              <p className="text-sm text-white/60 italic leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Line Items — {invoice.items.length} entries
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/40
                          ${i >= 2 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white/30 w-10">{item.index}</td>
                      <td className="px-6 py-4 text-sm text-white">{item.particulars}</td>
                      <td className="px-6 py-4 text-sm text-white/60 text-right tabular-nums">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60 text-right tabular-nums">
                        {fmtKes(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#33907C] text-right tabular-nums">
                        {fmtKes(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5 border-t border-white/20">
                    <td colSpan={4} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/50">
                      Grand Total
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-[#33907C] tabular-nums">
                      KES {fmtKes(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SubcontractorInvoicesPage() {
  const [invoices, setInvoices]       = useState<SubcontractorInvoiceListItem[]>([]);
  const [filtered, setFiltered]       = useState<SubcontractorInvoiceListItem[]>([]);
  const [search, setSearch]           = useState('');
  const [dateFilter, setDateFilter]   = useState('');       // single date (YYYY-MM-DD)
  const [dateFrom, setDateFrom]       = useState('');       // range start
  const [dateTo, setDateTo]           = useState('');       // range end
  const [dateMode, setDateMode]       = useState<'single' | 'range'>('single');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  const openDatePicker = () => {
    if (dateBtnRef.current) {
      const rect = dateBtnRef.current.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
    }
    setShowDatePicker(true);
  };
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const datePortalRef = useRef<HTMLDivElement>(null);
  const [siteFilter, setSiteFilter]   = useState('');
  const [sites, setSites]             = useState<SiteOption[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [total, setTotal]             = useState(0);
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get('/sites/list')
      .then(({ data }) => {
        const items: any[] = data?.data?.items ?? data?.data ?? data ?? [];
        setSites(items.map((s: any) => ({ id: s.id, name: s.name })));
      })
      .catch((err) => console.error('[Sites] fetch error:', err));
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = { skip: 0, limit: 100 };
      if (siteFilter) params.site_id = siteFilter;

      const { data } = await api.get('/subcontractor-invoices/all', { params });
      const list: SubcontractorInvoiceListItem[] = data?.data?.items ?? [];
      setTotal(data?.data?.total ?? list.length);

      const needsHydration = list.length > 0 && !list[0].createdBy;
      if (needsHydration) {
        const CHUNK = 10;
        const hydrated = [...list];
        for (let i = 0; i < list.length; i += CHUNK) {
          const chunk = list.slice(i, i + CHUNK);
          const results = await Promise.allSettled(
            chunk.map((inv) =>
              api
                .get(`/subcontractor-invoices/details/${inv.id}`)
                .then(({ data: d }) => ({ id: inv.id, createdBy: (d?.data ?? d)?.createdBy as BriefUserInfo }))
            ),
          );
          results.forEach((res) => {
            if (res.status === 'fulfilled' && res.value.createdBy) {
              const idx = hydrated.findIndex((h) => h.id === res.value.id);
              if (idx !== -1) hydrated[idx] = { ...hydrated[idx], createdBy: res.value.createdBy };
            }
          });
        }
        setInvoices(hydrated);
        setFiltered(hydrated);
      } else {
        setInvoices(list);
        setFiltered(list);
      }
    } catch (err) {
      console.error('[SubcontractorInvoices] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [siteFilter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = datePickerRef.current?.contains(target);
      const insidePortal  = datePortalRef.current?.contains(target);
      if (!insideTrigger && !insidePortal) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      let result = invoices;
      if (q) {
        result = result.filter(
          (inv) =>
            inv.invoiceNo.toLowerCase().includes(q) ||
            inv.contractorName.toLowerCase().includes(q),
        );
      }

      if (dateMode === 'single' && dateFilter) {
        result = result.filter((inv) => inv.invoiceDate.startsWith(dateFilter));
      }
 
      if (dateMode === 'range' && (dateFrom || dateTo)) {
        const from = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : 0;
        const to   = dateTo   ? new Date(dateTo   + 'T23:59:59').getTime() : Infinity;
        result = result.filter((inv) => {

          const raw = inv.invoiceDate;

          const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
          const t = new Date(cleaned).getTime();
          if (isNaN(t)) return true; // can't parse — include it
          return t >= from && t <= to;
        });
      }
      setFiltered(result);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, dateFilter, dateFrom, dateTo, dateMode, invoices]);

  if (selectedId !== null) {
    return <DetailPage invoiceId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const today = new Date().toISOString().split('T')[0];
  const hasDateFilter = dateMode === 'single' ? !!dateFilter : !!(dateFrom || dateTo);
  const hasFilters = search || hasDateFilter || siteFilter;

  const clearDateFilter = () => { setDateFilter(''); setDateFrom(''); setDateTo(''); };

  const dateBtnLabel = () => {
    if (dateMode === 'single' && dateFilter)
      return new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
    if (dateMode === 'range') {
      if (dateFrom && dateTo)
        return `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} – ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      if (dateFrom) return `From ${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`;
      if (dateTo)   return `To ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`;
    }
    return 'Filter by Date';
  };

  return (
    <>

      {showNewModal && (
        <NewInvoiceModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchInvoices(); // refresh list after creation
          }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Subcontractor Invoices</h2>
            <p className="text-sm text-blue-200/60">{total} total invoices</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-[#33907C] hover:bg-[#2a7566] text-white
                       text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg
                       shadow-[#33907C]/20"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>

        {/* Search + filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by invoice no or subcontractor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-[#33907C]
                           text-sm text-white placeholder-white/30"
              />
            </div>

            <div className="relative min-w-[180px]">
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="w-full appearance-none bg-white/10 border border-white/20 rounded-lg
                           text-sm text-white/70 px-3 py-2 pr-8
                           focus:outline-none focus:ring-2 focus:ring-[#33907C]
                           cursor-pointer [color-scheme:dark]"
              >
                <option value="">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>

            <div className="relative" ref={datePickerRef}>
              <button
                ref={dateBtnRef}
                type="button"
                onClick={() => showDatePicker ? setShowDatePicker(false) : openDatePicker()}
                className={`flex items-center gap-2 border rounded-lg text-sm px-3 py-2 transition-colors cursor-pointer select-none
                  ${hasDateFilter
                    ? 'bg-[#33907C]/20 border-[#33907C]/50 text-white'
                    : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15 hover:border-white/30'}
                  focus:outline-none focus:ring-2 focus:ring-[#33907C]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 opacity-70">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{dateBtnLabel()}</span>
                <ChevronDown size={12} className={`opacity-50 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
              </button>

              {showDatePicker && typeof document !== 'undefined' && createPortal(
                <div
                  ref={datePortalRef}
                  style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 99999 }}
                  className="w-72 bg-[#0d1b2a] border border-white/20 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)] p-4 space-y-4"
                >
                  {/* Mode toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-white/20 text-sm font-medium">
                    {(['single', 'range'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setDateMode(m); clearDateFilter(); }}
                        className={`flex-1 py-2 transition-colors capitalize
                          ${dateMode === m
                            ? 'bg-[#33907C] text-white'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'}`}
                      >
                        {m === 'single' ? 'Single Date' : 'Date Range'}
                      </button>
                    ))}
                  </div>

                  {dateMode === 'single' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Date</label>
                      <input
                        type="date"
                        value={dateFilter}
                        max={today}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                                   text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33907C]
                                   scheme-dark cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-white/40">From</label>
                        <input
                          type="date"
                          value={dateFrom}
                          max={dateTo || today}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                                     text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33907C]
                                     scheme-dark cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-white/40">To</label>
                        <input
                          type="date"
                          value={dateTo}
                          min={dateFrom || undefined}
                          max={today}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                                     text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33907C]
                                     scheme-dark cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {dateMode === 'range' && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
                      {[
                        { label: 'Today',       days: 0  },
                        { label: 'Last 7 days', days: 7  },
                        { label: 'Last 30 days',days: 30 },
                        { label: 'Last 90 days',days: 90 },
                      ].map(({ label, days }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const t = new Date();
                            const f = new Date();
                            f.setDate(f.getDate() - days);
                            setDateTo(t.toISOString().split('T')[0]);
                            setDateFrom(days === 0 ? t.toISOString().split('T')[0] : f.toISOString().split('T')[0]);
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#33907C]/30
                                     hover:text-white text-white/50 border border-white/10 transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex gap-2 pt-1 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => { clearDateFilter(); setShowDatePicker(false); }}
                      className="flex-1 py-2 text-sm text-white/50 hover:text-white bg-white/5
                                 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 py-2 text-sm text-white font-semibold bg-[#33907C]
                                 hover:bg-[#2a7566] rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>

            {hasFilters && (
              <button
                onClick={() => { setSearch(''); clearDateFilter(); setSiteFilter(''); }}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-2"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/40">
              <Receipt size={48} className="mb-3 opacity-30" />
              <p className="text-sm">No subcontractor invoices found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {['Invoice No', 'Subcontractor Name', 'Invoice Date', 'Amount (KShs)', 'Submitted By', ''].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedId(inv.id)}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#33907C]/20 rounded-lg flex items-center justify-center shrink-0">
                          <Receipt size={14} className="text-[#33907C]" />
                        </div>
                        <span className="text-sm font-medium text-white">{inv.invoiceNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">{inv.contractorName}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{inv.invoiceDate}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#33907C]">
                        KES {fmtKes(inv.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.createdBy ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#33907C]/20 flex items-center justify-center shrink-0">
                            <span className="text-[#33907C] font-bold text-xs">
                              {inv.createdBy.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-white/60">{inv.createdBy.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ChevronDown size={16} className="text-white/30 -rotate-90" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}