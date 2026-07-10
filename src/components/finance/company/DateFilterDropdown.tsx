'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

type FilterMode = 'single' | 'range';

const today = new Date().toISOString().split('T')[0];

interface CompanyDateFilterDropdownProps {
  appliedLabel: string;
  onApply: (start: string | undefined, end: string | undefined, label: string) => void;
  onClear: () => void;
}

export default function CompanyDateFilterDropdown({
  appliedLabel,
  onApply,
  onClear,
}: CompanyDateFilterDropdownProps) {
  const [open, setOpen]             = useState(false);
  const [mode, setMode]             = useState<FilterMode>('single');
  const [singleDate, setSingleDate] = useState('');
  const [fromDate, setFromDate]     = useState('');
  const [toDate, setToDate]         = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleApply = () => {
    if (mode === 'single') {
      if (!singleDate) return;
      onApply(singleDate, singleDate, singleDate);
    } else {
      if (!fromDate && !toDate) return;
      const label = fromDate && toDate ? `${fromDate} → ${toDate}` : fromDate || toDate;
      onApply(fromDate || undefined, toDate || undefined, label);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setSingleDate('');
    setFromDate('');
    setToDate('');
    onClear();
    setOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
        style={{
          background: appliedLabel ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
          border: `1px solid ${appliedLabel ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: appliedLabel ? '#33907c' : 'var(--gv-text-muted)',
        }}
      >
        <Calendar size={13} />
        <span>{appliedLabel || 'Filter by Date'}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-30"
          style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          <div className="flex p-2 gap-1" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            {(['single', 'range'] as FilterMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                style={{ background: mode === m ? '#33907c' : 'transparent', color: mode === m ? '#fff' : 'var(--gv-text-muted)' }}
              >
                {m === 'single' ? 'Single Date' : 'Date Range'}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-3">
            {mode === 'single' ? (
              <div>
                <p className="gv-eyebrow text-label-sm mb-1.5">Date</p>
                <input
                  type="date"
                  value={singleDate}
                  max={today}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="gv-input w-full text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            ) : (
              <>
                <div>
                  <p className="gv-eyebrow text-label-sm mb-1.5">From</p>
                  <input
                    type="date"
                    value={fromDate}
                    max={today}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <p className="gv-eyebrow text-label-sm mb-1.5">To</p>
                  <input
                    type="date"
                    value={toDate}
                    max={today}
                    onChange={(e) => setToDate(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#33907c', color: '#fff' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}