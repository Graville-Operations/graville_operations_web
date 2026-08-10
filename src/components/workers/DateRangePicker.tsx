'use client';

import { useEffect, useState, useRef } from 'react';
import { format, subDays } from 'date-fns';
import { CalendarRange } from 'lucide-react';

interface DateRangePickerProps {
  from: string;
  to: string;
  maxDate: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangePicker({ from, to, maxDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const ref = useRef<HTMLDivElement>(null);

  function handleOpen() { setDraftFrom(from); setDraftTo(to); setOpen(true); }
  function handleApply() {
    const f = draftFrom <= draftTo ? draftFrom : draftTo;
    const t = draftFrom <= draftTo ? draftTo : draftFrom;
    onChange(f, t);
    setOpen(false);
  }
  function handleCancel() { setOpen(false); }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const today = new Date();
  const presets = [
    { label: 'Today',         f: format(today, 'yyyy-MM-dd'),               t: format(today, 'yyyy-MM-dd') },
    { label: 'Yesterday',     f: format(subDays(today, 1), 'yyyy-MM-dd'),   t: format(subDays(today, 1), 'yyyy-MM-dd') },
    { label: 'Last 7 days',   f: format(subDays(today, 6), 'yyyy-MM-dd'),   t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 30 days',  f: format(subDays(today, 29), 'yyyy-MM-dd'),  t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 3 months', f: format(subDays(today, 89), 'yyyy-MM-dd'),  t: format(today, 'yyyy-MM-dd') },
    { label: 'Last 6 months', f: format(subDays(today, 179), 'yyyy-MM-dd'), t: format(today, 'yyyy-MM-dd') },
  ];

  return (
    // stopPropagation here so this can be embedded inside a clickable card
    // without opening/interacting with the picker triggering the card's own onClick
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
        style={{ color: 'var(--gv-brand)', background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}
      >
        <CalendarRange className="w-4 h-4" />Pick Range
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
          style={{
            background: 'var(--gv-nav-bg)',
            border: '1px solid var(--gv-glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            minWidth: 300,
            top: '100%',
            marginTop: 8,
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => {
              const active = draftFrom === p.f && draftTo === p.t;
              return (
                <button
                  key={p.label}
                  onClick={() => { setDraftFrom(p.f); setDraftTo(p.t); }}
                  className="text-sm px-2 py-1.5 rounded-xl text-left cursor-pointer"
                  style={{
                    background: active ? 'var(--gv-brand)' : 'var(--gv-glass-bg-strong)',
                    border: `1px solid ${active ? 'var(--gv-brand)' : 'var(--gv-glass-border)'}`,
                    color: active ? 'white' : 'var(--gv-text-muted)',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>From</label>
              <input
                type="date"
                value={draftFrom}
                max={maxDate}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="gv-input text-base py-2 w-full cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>To</label>
              <input
                type="date"
                value={draftTo}
                min={draftFrom}
                max={maxDate}
                onChange={(e) => setDraftTo(e.target.value)}
                className="gv-input text-base py-2 w-full cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="flex-1 text-base py-2 rounded-xl cursor-pointer"
              style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 text-base py-2 rounded-xl font-semibold text-white cursor-pointer"
              style={{ background: 'var(--gv-brand)' }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}