'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Invoice,
  RawInvoice,
  RawPaginatedResponse,
  normaliseInvoice,
} from '@/types/invoice';
import { Search, Eye, Receipt, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';

interface Site { id: number; name: string; location: string; }

const statusStyles: Record<string, { bg: string; color: string }> = {
  PENDING:        { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:       { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  REJECTED:       { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  PARTIALLY_PAID: { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  FULLY_PAID:     { bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
};

const today = new Date().toISOString().slice(0, 10);

function ShimmerRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)', width: i === 0 ? '80px' : i === 4 ? '60px' : '100px' }} />
        </td>
      ))}
    </tr>
  );
}

function ShimmerCard() {
  return (
    <div className="gv-card space-y-3" style={{ padding: '14px 16px' }}>
      <div className="flex justify-between">
        <div className="h-3.5 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-3.5 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
      <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );
}

/* ── Site dropdown ── */
function SiteSelect({
  sites,
  value,
  onChange,
}: {
  sites: Site[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = sites.find((s) => String(s.id) === value);

  return (
    <div className="relative shrink-0" ref={ref} style={{ width: '150px' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl text-sm"
        style={{
          background: value ? 'rgba(51,144,124,0.08)' : 'var(--gv-glass-bg)',
          border: `1px solid ${value ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: value ? 'var(--gv-text-primary)' : 'var(--gv-text-muted)',
        }}
      >
        <span className="truncate text-xs">{selected?.name ?? 'All Sites'}</span>
        <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--gv-text-subtle)' }} />
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-full rounded-2xl z-30 overflow-hidden"
          style={{
            background: '#0d1528',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          {/* All sites option */}
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs transition-colors"
            style={{
              background: !value ? 'rgba(51,144,124,0.15)' : 'transparent',
              color: !value ? '#33907c' : 'var(--gv-text-muted)',
              borderBottom: '1px solid var(--gv-glass-border)',
            }}
            onMouseEnter={(e) => { if (value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { if (value) e.currentTarget.style.background = 'transparent'; }}
          >
            All Sites
          </button>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => { onChange(String(s.id)); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                style={{
                  background: String(s.id) === value ? 'rgba(51,144,124,0.15)' : 'transparent',
                  color: String(s.id) === value ? '#33907c' : 'var(--gv-text-muted)',
                }}
                onMouseEnter={(e) => { if (String(s.id) !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (String(s.id) !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Date filter picker ── */
function DateFilterPicker({
  startDate, endDate, onApply, onClear,
}: {
  startDate: string; endDate: string;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen]             = useState(false);
  const [mode, setMode]             = useState<'single' | 'range'>('single');
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd,   setLocalEnd]   = useState(endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setLocalStart(startDate); setLocalEnd(endDate); }, [startDate, endDate]);

  const hasActive = !!(startDate || endDate);
  const label = hasActive
    ? mode === 'single' ? startDate : `${startDate} → ${endDate || '…'}`
    : 'Filter by Date';

  const handleApply = () => {
    const end = mode === 'single' ? localStart : localEnd;
    onApply(localStart, end);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalStart(''); setLocalEnd('');
    onClear();
    setOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
        style={{
          background: hasActive ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
          border:     `1px solid ${hasActive ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color:      hasActive ? '#33907c' : 'var(--gv-text-muted)',
        }}
      >
        <Calendar size={13} />
        <span className="text-xs font-medium">{label}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl z-30 overflow-hidden"
          style={{
            background: '#0d1528',
            border:     '1px solid var(--gv-glass-border)',
            boxShadow:  '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          {/* Mode toggle */}
          <div className="flex p-2 gap-1" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            {(['single', 'range'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setLocalEnd(''); }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: mode === m ? '#33907c' : 'transparent',
                  color:      mode === m ? '#fff' : 'var(--gv-text-muted)',
                }}
              >
                {m === 'single' ? 'Single Date' : 'Date Range'}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3">
            {mode === 'single' ? (
              <div className="space-y-1.5">
                <p className="gv-eyebrow text-[10px]">Date</p>
                <input type="date" max={today} value={localStart}
                  onChange={(e) => setLocalStart(e.target.value)}
                  className="gv-input w-full text-sm"
                  style={{ colorScheme: 'dark' }} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="gv-eyebrow text-[10px]">From</p>
                  <input type="date" max={today} value={localStart}
                    onChange={(e) => setLocalStart(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }} />
                </div>
                <div className="space-y-1.5">
                  <p className="gv-eyebrow text-[10px]">To</p>
                  <input type="date" min={localStart || undefined} max={today} value={localEnd}
                    onChange={(e) => setLocalEnd(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={handleClear} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                Clear
              </button>
              <button onClick={handleApply} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#33907c', color: '#fff' }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="flex flex-col items-center justify-center h-48">
    <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
    <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{msg}</p>
  </div>
);

export default function SupplierInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [sites, setSites]         = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [siteId, setSiteId]       = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  useEffect(() => {
    api.get('/sites/list')
      .then(({ data }) => setSites(data?.data?.items ?? data?.data ?? []))
      .catch((err) => console.error('Failed to fetch sites:', err));
  }, []);

  const fetchInvoices = async (sid: string, start: string, end: string) => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (sid)   params.site_id    = sid;
      if (start) params.start_date = start;
      if (end)   params.end_date   = end;
      const { data } = await api.get('/invoices/all', { params });
      const res = data as RawPaginatedResponse<RawInvoice>;
      setInvoices((res?.data?.items ?? []).map(normaliseInvoice));
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(siteId, startDate, endDate); }, [siteId, startDate, endDate]);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.supplier_name.toLowerCase().includes(q)  ||
      (inv.submitted_by ?? '').toLowerCase().includes(q)
    );
  });

  const hasFilter = !!(search || siteId || startDate || endDate);

  const openDetail = (inv: Invoice) => {
    // Stash all list-visible fields so the detail page can render instantly
    sessionStorage.setItem(`invoice_${inv.id}_preview`, JSON.stringify({
      invoice_number:  inv.invoice_number,
      supplier_name:   inv.supplier_name,
      status:          inv.status,
      total_amount:    inv.total_amount,
      amount_paid:     inv.amount_paid,
      submitted_by:    inv.submitted_by  ?? '',
      site:            inv.site          ?? '',
      invoice_date:    inv.invoice_date  ?? '',
    }));
    router.push(`/finance/invoice/supplier/${inv.id}`);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>Supplier Invoices</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
          {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}{hasFilter ? ' (filtered)' : ''}
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="gv-card !p-3">
        <div className="flex items-center gap-2">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gv-text-subtle)' }} />
            <input
              type="text"
              placeholder="Search by invoice no, supplier, requester…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gv-input !pl-9 !py-2 text-sm w-full"
            />
          </div>

          {/* Site — dark custom dropdown */}
          <SiteSelect
            sites={sites}
            value={siteId}
            onChange={setSiteId}
          />

          {/* Date filter */}
          <DateFilterPicker
            startDate={startDate}
            endDate={endDate}
            onApply={(start, end) => { setStartDate(start); setEndDate(end); }}
            onClear={() => { setStartDate(''); setEndDate(''); }}
          />

          {/* Clear all active filters */}
          {hasFilter && (search || siteId || startDate || endDate) && (siteId || startDate || endDate) && (
            <button
              onClick={() => { setSiteId(''); setStartDate(''); setEndDate(''); }}
              className="p-2 rounded-lg shrink-0"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="gv-card !p-0 overflow-hidden hidden md:block">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {['Invoice No', 'Supplier', 'Invoiced By', 'Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState msg={hasFilter ? 'No invoices match your filters' : 'No invoices found'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Invoice No', 'Supplier', 'Invoiced By', 'Date', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => {
                  const st = statusStyles[inv.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => openDetail(inv)}
                      className="cursor-pointer"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid var(--gv-glass-border)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.supplier_name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.submitted_by ?? '—'}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.invoice_date ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>KES {inv.total_amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                          {inv.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Mobile cards ── */}
      <div className="space-y-2 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState msg={hasFilter ? 'No invoices match your filters' : 'No invoices found'} />
        ) : filtered.map((inv) => {
          const st = statusStyles[inv.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--gv-text-muted)' };
          return (
            <div
              key={inv.id}
              onClick={() => openDetail(inv)}
              className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: '14px 16px' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold" style={{ color: 'var(--gv-text-primary)' }}>{inv.invoice_number}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                  {inv.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--gv-text-muted)' }}>{inv.supplier_name}</p>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {inv.submitted_by && (
                  <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>by {inv.submitted_by}</span>
                )}
                {inv.invoice_date && (
                  <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>· {inv.invoice_date}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>KES {inv.total_amount.toLocaleString()}</span>
                <Eye size={14} style={{ color: 'var(--gv-text-subtle)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}