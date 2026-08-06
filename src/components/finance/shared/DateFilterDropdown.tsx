'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

function defaultLabel(from: string, to: string): string {
  if (from && to) return from === to ? from : `${from} → ${to}`;
  return from || to;
}

interface DateFilterDropdownProps {
  from: string;
  to: string;
  appliedLabel?: string;
  onApply: (from: string, to: string) => void;
  onClear: () => void;
}

export default function DateFilterDropdown({
  from,
  to,
  appliedLabel,
  onApply,
  onClear,
}: DateFilterDropdownProps) {
  const [open, setOpen]             = useState(false);
  const [mode, setMode]             = useState<'single' | 'range'>('single');
  const [localFrom, setLocalFrom]   = useState(from);
  const [localTo, setLocalTo]       = useState(to);
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
    setLocalFrom(from);
    setLocalTo(to);
  }, [from, to]);

  const hasActive = !!(from || to);
  const label = hasActive ? (appliedLabel ?? defaultLabel(from, to)) : 'Filter by Date';

  const handleApply = () => {
    if (mode === 'single') {
      if (!localFrom) return;
      onApply(localFrom, localFrom);
    } else {
      if (!localFrom && !localTo) return;
      onApply(localFrom, localTo);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFrom('');
    setLocalTo('');
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
                  setLocalTo('');
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
                  value={localFrom}
                  onChange={(e) => setLocalFrom(e.target.value)}
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
                    value={localFrom}
                    onChange={(e) => setLocalFrom(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="gv-eyebrow text-label-sm">To</p>
                  <input
                    type="date"
                    min={localFrom || undefined}
                    max={today}
                    value={localTo}
                    onChange={(e) => setLocalTo(e.target.value)}
                    className="gv-input w-full text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Last 7 days', days: 7 },
                    { label: 'Last 30 days', days: 30 },
                    { label: 'Last 90 days', days: 90 },
                  ].map(({ label: quickLabel, days }) => (
                    <button
                      key={quickLabel}
                      onClick={() => {
                        const t = new Date();
                        const f = new Date();
                        f.setDate(f.getDate() - days);
                        setLocalTo(t.toISOString().slice(0, 10));
                        setLocalFrom(days === 0 ? t.toISOString().slice(0, 10) : f.toISOString().slice(0, 10));
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                      style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
                    >
                      {quickLabel}
                    </button>
                  ))}
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