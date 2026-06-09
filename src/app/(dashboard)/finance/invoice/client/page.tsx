'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Receipt, Search, ChevronDown, X, Calendar } from 'lucide-react';

interface ClientInvoice {
  id:          number;
  invoiceNo:   string;
  clientName:  string;
  invoiceDate: string;
  total:       number;
  createdAt:   string;
}

interface Site {
  id:   number;
  name: string;
}

type DateFilterMode = 'single' | 'range';

// Parses "8th June 2026" or "8th June2026" → "2026-06-08"
const parseBackendDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    // Strip ordinal suffix: "8th" → "8", "1st" → "1", etc.
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1');
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // "2026-06-08"
  } catch {
    return '';
  }
};

export default function ClientInvoicesPage() {
  const router  = useRouter();
  const calendarRef = useRef<HTMLDivElement>(null);
  const siteRef  = useRef<HTMLDivElement>(null);

  const [invoices,  setInvoices] = useState<ClientInvoice[]>([]);
  const [filtered, setFiltered] = useState<ClientInvoice[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading]       = useState(true);
  const [total, setTotal] = useState(0);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite]    = useState<Site | null>(null);
  const [siteOpen, setSiteOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateMode, setDateMode] = useState<DateFilterMode>('single');
  const [singleDate, setSingleDate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeDateLabel, setActiveDateLabel] = useState('');
  const today = new Date().toISOString().split('T')[0]; // "2026-06-09"

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setCalendarOpen(false);
      if (siteRef.current && !siteRef.current.contains(e.target as Node))
        setSiteOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => {
    api.get('/sites/list?limit=100')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        const list: Site[] = payload?.items ?? (Array.isArray(payload) ? payload : []);
        setSites(list);
      })
      .catch((err) => console.error('[Sites]', err));
  }, []);
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        let url = '/client-invoices/all?limit=100';
        if (selectedSite) url += `&site_id=${selectedSite.id}`;
        const { data } = await api.get(url);
        const payload = data?.data ?? data;
        const list: ClientInvoice[] = payload?.items ?? (Array.isArray(payload) ? payload : []);
        setInvoices(list);
        setFiltered(list);
        setTotal(payload?.total ?? list.length);
      } catch (err) {
        console.error('[ClientInvoices]', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedSite]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      let result = invoices.filter(
        (inv) =>
          inv.invoiceNo?.toLowerCase().includes(q) ||
          inv.clientName?.toLowerCase().includes(q)
      );

      if (activeDateLabel) {
        if (dateMode === 'single' && singleDate) {
          result = result.filter(
            (inv) => parseBackendDate(inv.invoiceDate) === singleDate
          );
        } else if (dateMode === 'range' && dateFrom && dateTo) {
          result = result.filter((inv) => {
            const d = parseBackendDate(inv.invoiceDate);
            return d !== '' && d >= dateFrom && d <= dateTo;
          });
        }
      }

      setFiltered(result);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, invoices, activeDateLabel, dateMode, singleDate, dateFrom, dateTo]);

  const applyDateFilter = () => {
    if (dateMode === 'single' && singleDate)
      setActiveDateLabel(`On ${singleDate}`);
    else if (dateMode === 'range' && dateFrom && dateTo)
      setActiveDateLabel(`${dateFrom} → ${dateTo}`);
    setCalendarOpen(false);
  };

  const clearDateFilter = () => {
    setSingleDate('');
    setDateFrom('');
    setDateTo('');
    setActiveDateLabel('');
    setCalendarOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            Client Invoices
          </h2>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            {total} total invoices
          </p>
        </div>
        <Link href="/finance/invoice/client/new" className="gv-btn-brand gap-2 text-sm">
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="gv-card space-y-3" style={{ overflow: 'visible' }}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--gv-text-faint)' }}
          />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input pl-10"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">

          {/* Site dropdown */}
          <div className="relative" ref={siteRef}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSiteOpen((p) => !p); setCalendarOpen(false); }}
                className={`gv-btn-pill gap-2 ${selectedSite ? 'gv-pill-active' : ''}`}
              >
                <span>{selectedSite ? selectedSite.name : 'All Sites'}</span>
                <ChevronDown
                  size={13}
                  style={{
                    transform:  siteOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {selectedSite && (
                <button
                  onClick={() => setSelectedSite(null)}
                  className="p-1 rounded-full transition-colors hover:bg-white/10"
                  style={{ color: 'var(--gv-text-faint)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {siteOpen && (
              <div className="gv-dropdown" style={{ width: '14rem' }}>
                <div style={{ maxHeight: '13rem', overflowY: 'auto' }}>
                  <button
                    onClick={() => { setSelectedSite(null); setSiteOpen(false); }}
                    className={`gv-dropdown-item ${!selectedSite ? 'gv-dropdown-item--active' : ''}`}
                  >
                    All Sites
                  </button>
                  {sites.length === 0 ? (
                    <p className="px-4 py-3 text-xs" style={{ color: 'var(--gv-text-faint)' }}>
                      No sites found
                    </p>
                  ) : (
                    sites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => { setSelectedSite(site); setSiteOpen(false); }}
                        className={`gv-dropdown-item ${selectedSite?.id === site.id ? 'gv-dropdown-item--active' : ''}`}
                      >
                        {site.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date filter */}
          <div className="relative" ref={calendarRef}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCalendarOpen((p) => !p); setSiteOpen(false); }}
                className={`gv-btn-pill gap-2 ${activeDateLabel ? 'gv-pill-active' : ''}`}
              >
                <Calendar size={13} />
                <span>{activeDateLabel || 'Filter by Date'}</span>
                <ChevronDown
                  size={13}
                  style={{
                    transform:  calendarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {activeDateLabel && (
                <button
                  onClick={clearDateFilter}
                  className="p-1 rounded-full transition-colors hover:bg-white/10"
                  style={{ color: 'var(--gv-text-faint)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {calendarOpen && (
              <div
                className="gv-dropdown"
                style={{ width: '17rem', overflow: 'visible', padding: '1rem' }}
              >
                <div className="space-y-4">
                  {/* Mode toggle */}
                  <div
                    className="flex rounded-lg overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    {(['single', 'range'] as DateFilterMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDateMode(mode)}
                        className="flex-1 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: dateMode === mode ? 'var(--gv-brand)' : 'transparent',
                          color:      dateMode === mode ? '#fff' : 'var(--gv-text-muted)',
                        }}
                      >
                        {mode === 'single' ? 'Single Date' : 'Date Range'}
                      </button>
                    ))}
                  </div>

                  {dateMode === 'single' && (
                    <div className="space-y-1">
                      <label className="gv-label">Date</label>
                      <input
                        type="date"
                        value={singleDate}
                        onChange={(e) => setSingleDate(e.target.value)}
                        max={today}
                        className="gv-input"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  )}

                  {dateMode === 'range' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="gv-label">From</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          max={dateTo || today} 
                          className="gv-input"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="gv-label">To</label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom} 
                          max={today} 
                          className="gv-input"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={clearDateFilter}
                      className="gv-btn-outline flex-1 py-1.5 text-xs"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyDateFilter}
                      disabled={dateMode === 'single' ? !singleDate : !dateFrom || !dateTo}
                      className="gv-btn-brand flex-1 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(selectedSite || activeDateLabel) && (
            <button
              onClick={() => { setSelectedSite(null); clearDateFilter(); }}
              className="text-xs underline transition-colors"
              style={{ color: 'var(--gv-text-faint)' }}
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="gv-card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--gv-brand)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-48 gap-2"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            <Receipt size={40} className="opacity-30" />
            <p className="text-sm">No invoices found</p>
            <Link
              href="/finance/invoice/client/new"
              className="text-xs mt-1 hover:underline"
              style={{ color: 'var(--gv-brand)' }}
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead
              style={{
                background:   'rgba(255,255,255,0.04)',
                borderBottom: '1px solid var(--gv-glass-border)',
              }}
            >
              <tr>
                {['Invoice No.', 'Client', 'Date', 'Amount (KES)'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--gv-text-subtle)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/finance/invoice/client/${inv.id}`)}
                  className="transition-colors cursor-pointer hover:bg-white/5"
                  style={{
                    borderTop: i > 0 ? '1px solid var(--gv-glass-border)' : undefined,
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                        <Receipt size={14} style={{ color: 'var(--gv-brand)' }} />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--gv-text-primary)' }}
                      >
                        {inv.invoiceNo ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    {inv.clientName ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                    {inv.invoiceDate ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold" style={{ color: 'var(--gv-brand)' }}>
                      {inv.total?.toLocaleString() ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}