'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  CompanyInvoice,
  RawCompanyInvoice,
  normaliseCompanyInvoice,
} from '@/types/company_invoices';
import { RawPaginatedResponse } from '@/types/invoice';
import { Search, Plus, Receipt, Calendar, X, ChevronDown } from 'lucide-react';

type FilterMode = 'single' | 'range';

function ShimmerRow() {
  return (
    <tr>
      {Array.from({ length: 4 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)', width: i === 0 ? '80px' : i === 3 ? '60px' : '100px' }} />
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

export default function CompanyInvoicesPage() {
  const router = useRouter();
  const today  = new Date().toISOString().split('T')[0];

  const [invoices, setInvoices]   = useState<CompanyInvoice[]>([]);
  const [filtered, setFiltered]   = useState<CompanyInvoice[]>([]);
  const [search, setSearch]       = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterMode, setFilterMode]         = useState<FilterMode>('single');
  const [singleDate, setSingleDate]         = useState('');
  const [fromDate, setFromDate]             = useState('');
  const [toDate, setToDate]                 = useState('');
  const [appliedLabel, setAppliedLabel]     = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowDatePicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      invoices.filter((i) =>
        i.invoice_number.toLowerCase().includes(q) ||
        (i.invoiced_by ?? '').toLowerCase().includes(q)
      )
    );
  }, [search, invoices]);

  const fetchInvoices = async (start?: string, end?: string) => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (start) params.start_date = start;
      if (end)   params.end_date   = end;
      const { data }   = await api.get('/company-invoices/all', { params });
      const res        = data as RawPaginatedResponse<RawCompanyInvoice>;
      const normalised = (res?.data?.items ?? []).map(normaliseCompanyInvoice);
      setInvoices(normalised);
      setFiltered(normalised);
    } catch (err) {
      console.error('Failed to fetch company invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyDateFilter = () => {
    if (filterMode === 'single') {
      if (!singleDate) return;
      fetchInvoices(singleDate, singleDate);
      setAppliedLabel(singleDate);
    } else {
      if (!fromDate && !toDate) return;
      fetchInvoices(fromDate || undefined, toDate || undefined);
      setAppliedLabel(fromDate && toDate ? `${fromDate} → ${toDate}` : fromDate || toDate);
    }
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setAppliedLabel('');
    fetchInvoices();
    setShowDatePicker(false);
  };

  const openDetail = (inv: CompanyInvoice) => {
    sessionStorage.setItem(`cinv_${inv.id}`, JSON.stringify({
      invoice_number: inv.invoice_number,
      invoiced_by:    inv.invoiced_by,
      invoice_date:   inv.invoice_date,
      total:          inv.total,
    }));
    router.push(`/finance/invoice/company/${inv.id}`);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48">
      <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
      <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
        {search || appliedLabel ? 'No results for your filter' : 'No company invoices found'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>Company Invoices</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/finance/invoice/company/create')}
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="gv-card !p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gv-text-subtle)' }} />
            <input
              type="text"
              placeholder="Search by invoice no, invoiced by..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gv-input !pl-9 !py-2 text-sm w-full"
            />
          </div>

          <div className="relative flex-shrink-0" ref={pickerRef}>
            <button
              onClick={() => setShowDatePicker((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{
                background: appliedLabel ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
                border: `1px solid ${appliedLabel ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
                color: appliedLabel ? '#33907c' : 'var(--gv-text-muted)',
              }}
            >
              <Calendar size={13} />
              <span>{appliedLabel || 'Filter by Date'}</span>
              <ChevronDown size={13} className={`transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {showDatePicker && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-30"
                style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
              >
                <div className="flex p-2 gap-1" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {(['single', 'range'] as FilterMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                      style={{
                        background: filterMode === mode ? '#33907c' : 'transparent',
                        color: filterMode === mode ? '#fff' : 'var(--gv-text-muted)',
                      }}
                    >
                      {mode === 'single' ? 'Single Date' : 'Date Range'}
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-3">
                  {filterMode === 'single' ? (
                    <div>
                      <p className="gv-eyebrow text-[10px] mb-1.5">Date</p>
                      <input type="date" value={singleDate} max={today}
                        onChange={(e) => setSingleDate(e.target.value)}
                        className="gv-input w-full text-sm"
                        style={{ colorScheme: 'dark' }} />
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="gv-eyebrow text-[10px] mb-1.5">From</p>
                        <input type="date" value={fromDate} max={today}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="gv-input w-full text-sm"
                          style={{ colorScheme: 'dark' }} />
                      </div>
                      <div>
                        <p className="gv-eyebrow text-[10px] mb-1.5">To</p>
                        <input type="date" value={toDate} max={today}
                          onChange={(e) => setToDate(e.target.value)}
                          className="gv-input w-full text-sm"
                          style={{ colorScheme: 'dark' }} />
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={clearDateFilter} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                      Clear
                    </button>
                    <button onClick={applyDateFilter} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: '#33907c', color: '#fff' }}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {appliedLabel && (
            <button onClick={clearDateFilter} className="p-2 rounded-lg flex-shrink-0"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="gv-card !p-0 overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
              {['Invoice No', 'Invoiced By', 'Invoice Date', 'Total'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4}><EmptyState /></td></tr>
            ) : (
              filtered.map((inv, idx) => (
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
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.invoiced_by ?? '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{inv.invoice_date ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                    KES {inv.total.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="space-y-2 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((inv) => (
            <div
              key={inv.id}
              onClick={() => openDetail(inv)}
              className="gv-card cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: '14px 16px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: 'var(--gv-text-primary)' }}>#{inv.invoice_number}</span>
                <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{inv.invoice_date ?? '—'}</span>
              </div>
              <p className="text-sm mb-2.5" style={{ color: 'var(--gv-text-muted)' }}>{inv.invoiced_by ?? '—'}</p>
              <div className="flex items-center justify-end pt-2.5" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                  KES {inv.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}