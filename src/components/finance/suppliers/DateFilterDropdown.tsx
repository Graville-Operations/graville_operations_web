'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

interface DateFilterDropdownProps {
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
}

export default function DateFilterDropdown({
  startDate,
  endDate,
  onApply,
  onClear,
}: DateFilterDropdownProps) {
  const [open, setOpen]             = useState(false);
  const [mode, setMode]             = useState<'single' | 'range'>('single');
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd]     = useState(endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);

  const hasActive = !!(startDate || endDate);
  const label = hasActive
    ? mode === 'single'
      ? startDate
      : `${startDate} → ${endDate || '…'}`
    : 'Filter by Date';

  const handleApply = () => {
    const end = mode === 'single' ? localStart : localEnd;
    onApply(localStart, end);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalStart('');
    setLocalEnd('');
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
          border: `1px solid ${hasActive ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: hasActive ? '#33907c' : 'var(--gv-text-muted)',
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
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex p-2 gap-1" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            {(['single', 'range'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setLocalEnd('');
                }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: mode === m ? '#33907c' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--gv-text-muted)',
                }}
              >
                {m === 'single' ? 'Single Date' : 'Date Range'}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3">
            {mode === 'single' ? (
              <div className="space-y-1.5">
                <p className="gv-eyebrow text-label-sm">Date</p>
                <input
                  type="date"
                  max={today}
                  value={localStart}
                  onChange={(e) => setLocalStart(e.target.value)}
                  className="gv-input w-full text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="gv-eyebrow text-label-sm">From</p>
                  <input
                    type="date"
                    max={today}
                    value={localStart}
                    onChange={(e) => setLocalStart(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="gv-eyebrow text-label-sm">To</p>
                  <input
                    type="date"
                    min={localStart || undefined}
                    max={today}
                    value={localEnd}
                    onChange={(e) => setLocalEnd(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: 'var(--gv-glass-bg)',
                  color: 'var(--gv-text-muted)',
                  border: '1px solid var(--gv-glass-border)',
                }}
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