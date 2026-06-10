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

const today = new Date().toISOString().split('T')[0];

const parseBackendDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1');
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/* ── shared dropdown card style matching image 2 ── */
const dropdownCard: React.CSSProperties = {
  position:              'absolute',
  top:                   'calc(100% + 8px)',
  right:                 0,
  left:                  'auto',
  zIndex:                9999,
  background:            '#0d1828',
  backdropFilter:        'blur(20px)',
  WebkitBackdropFilter:  'blur(20px)',
  border:                '1px solid rgba(255,255,255,0.15)',
  borderRadius:          '0.875rem',
  boxShadow:             '0 12px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)',
  padding:               '1.25rem',
  overflow:              'visible',
};

export default function ClientInvoicesPage() {
  const router      = useRouter();
  const calendarRef = useRef<HTMLDivElement>(null);
  const siteRef     = useRef<HTMLDivElement>(null);

  const [invoices,  setInvoices]  = useState<ClientInvoice[]>([]);
  const [filtered,  setFiltered]  = useState<ClientInvoice[]>([]);
  const [search,    setSearch]    = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total,     setTotal]     = useState(0);
  const [sites,     setSites]     = useState<Site[]>([]);

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [siteOpen,     setSiteOpen]     = useState(false);

  const [calendarOpen,    setCalendarOpen]    = useState(false);
  const [dateMode,        setDateMode]        = useState<DateFilterMode>('single');
  const [singleDate,      setSingleDate]      = useState('');
  const [dateFrom,        setDateFrom]        = useState('');
  const [dateTo,          setDateTo]          = useState('');
  const [activeDateLabel, setActiveDateLabel] = useState('');

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
          inv.clientName?.toLowerCase().includes(q),
      );
      if (activeDateLabel) {
        if (dateMode === 'single' && singleDate) {
          result = result.filter((inv) => parseBackendDate(inv.invoiceDate) === singleDate);
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

  const hasActiveFilters = !!(selectedSite || activeDateLabel);

  /* ── shared date input style matching image 2 ── */
  const dateInputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '0.65rem 0.875rem',
    background:   'rgba(255,255,255,0.07)',
    border:       '1px solid rgba(255,255,255,0.22)',
    borderRadius: '0.5rem',
    color:        'var(--gv-text-primary)',
    fontSize:     '0.9rem',
    outline:      'none',
    colorScheme:  'dark' as never,
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
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

      {/* ── Search + Filters ── */}
      <div className="gv-card" style={{ overflow: 'visible' }}>
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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

          {/* ── All Sites pill + dropdown ── */}
          <div className="relative flex-shrink-0" ref={siteRef}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSiteOpen((p) => !p); setCalendarOpen(false); }}
                className={`gv-btn-pill gap-2 ${selectedSite ? 'gv-pill-active' : ''}`}
              >
                <span>{selectedSite ? selectedSite.name : 'All Sites'}</span>
                <ChevronDown
                  size={13}
                  style={{ transform: siteOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
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
              <div style={{ ...dropdownCard, width: '15rem' }}>
                {/* header */}
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gv-text-subtle)', marginBottom: '0.75rem' }}>
                  Site
                </p>
                <div style={{ maxHeight: '14rem', overflowY: 'auto', margin: '0 -0.25rem' }}>
                  {/* All Sites option */}
                  <button
                    onClick={() => { setSelectedSite(null); setSiteOpen(false); }}
                    style={{
                      display:      'block',
                      width:        '100%',
                      textAlign:    'left',
                      padding:      '0.55rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize:     '0.875rem',
                      background:   !selectedSite ? 'rgba(51,144,124,0.15)' : 'transparent',
                      color:        !selectedSite ? 'var(--gv-brand)' : 'var(--gv-text-muted)',
                      fontWeight:   !selectedSite ? 600 : 400,
                      border:       'none',
                      cursor:       'pointer',
                      transition:   'background 0.15s',
                    }}
                  >
                    All Sites
                  </button>
                  {sites.length === 0 ? (
                    <p style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--gv-text-faint)' }}>
                      No sites found
                    </p>
                  ) : (
                    sites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => { setSelectedSite(site); setSiteOpen(false); }}
                        style={{
                          display:      'block',
                          width:        '100%',
                          textAlign:    'left',
                          padding:      '0.55rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize:     '0.875rem',
                          background:   selectedSite?.id === site.id ? 'rgba(51,144,124,0.15)' : 'transparent',
                          color:        selectedSite?.id === site.id ? 'var(--gv-brand)' : 'var(--gv-text-muted)',
                          fontWeight:   selectedSite?.id === site.id ? 600 : 400,
                          border:       'none',
                          cursor:       'pointer',
                          transition:   'background 0.15s',
                        }}
                      >
                        {site.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Filter by Date pill + dropdown ── */}
          <div className="relative flex-shrink-0" ref={calendarRef}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCalendarOpen((p) => !p); setSiteOpen(false); }}
                className={`gv-btn-pill gap-2 ${activeDateLabel ? 'gv-pill-active' : ''}`}
              >
                <Calendar size={13} />
                <span>{activeDateLabel || 'Filter by Date'}</span>
                <ChevronDown
                  size={13}
                  style={{ transform: calendarOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
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
              <div style={{ ...dropdownCard, width: '20rem' }}>

                {/* Mode toggle — pill style matching image 2 */}
                <div
                  style={{
                    display:      'flex',
                    background:   'rgba(255,255,255,0.06)',
                    borderRadius: '9999px',
                    padding:      '3px',
                    marginBottom: '1.25rem',
                  }}
                >
                  {(['single', 'range'] as DateFilterMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDateMode(mode)}
                      style={{
                        flex:         1,
                        padding:      '0.45rem 0',
                        borderRadius: '9999px',
                        fontSize:     '0.8rem',
                        fontWeight:   500,
                        border:       'none',
                        cursor:       'pointer',
                        transition:   'background 0.2s, color 0.2s',
                        background:   dateMode === mode ? 'var(--gv-brand)' : 'transparent',
                        color:        dateMode === mode ? '#ffffff' : 'var(--gv-text-muted)',
                      }}
                    >
                      {mode === 'single' ? 'Single Date' : 'Date Range'}
                    </button>
                  ))}
                </div>

                {/* Single date */}
                {dateMode === 'single' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gv-text-subtle)', marginBottom: '0.5rem' }}>
                      Date
                    </p>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      max={today}
                      style={dateInputStyle}
                    />
                  </div>
                )}

                {/* Date range */}
                {dateMode === 'range' && (
                  <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gv-text-subtle)', marginBottom: '0.5rem' }}>
                        From
                      </p>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        max={dateTo || today}
                        style={dateInputStyle}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gv-text-subtle)', marginBottom: '0.5rem' }}>
                        To
                      </p>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        min={dateFrom}
                        max={today}
                        style={dateInputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={clearDateFilter}
                    style={{
                      flex:         1,
                      padding:      '0.6rem',
                      borderRadius: '0.5rem',
                      fontSize:     '0.875rem',
                      fontWeight:   500,
                      background:   'rgba(255,255,255,0.07)',
                      border:       '1px solid rgba(255,255,255,0.15)',
                      color:        'var(--gv-text-muted)',
                      cursor:       'pointer',
                      transition:   'background 0.15s',
                    }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyDateFilter}
                    disabled={dateMode === 'single' ? !singleDate : !dateFrom || !dateTo}
                    style={{
                      flex:         1,
                      padding:      '0.6rem',
                      borderRadius: '0.5rem',
                      fontSize:     '0.875rem',
                      fontWeight:   600,
                      background:   'var(--gv-brand)',
                      border:       'none',
                      color:        '#ffffff',
                      cursor:       'pointer',
                      opacity:      (dateMode === 'single' ? !singleDate : !dateFrom || !dateTo) ? 0.4 : 1,
                      transition:   'background 0.15s, opacity 0.15s',
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSelectedSite(null); clearDateFilter(); }}
              className="shrink-0 text-xs underline transition-colors"
              style={{ color: 'var(--gv-text-faint)' }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
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
                  style={{ borderTop: i > 0 ? '1px solid var(--gv-glass-border)' : undefined }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                        <Receipt size={14} style={{ color: 'var(--gv-brand)' }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>
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