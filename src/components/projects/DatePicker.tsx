'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export function DatePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const today = new Date();
  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value + 'T00:00:00') : null;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth()    === viewMonth &&
    selected.getDate()     === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === day;

  const displayValue = selected
    ? selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div ref={wrapRef} className="relative w-full">
      <div
        className="gv-input w-full flex items-center justify-between cursor-pointer select-none"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
        onClick={() => !disabled && setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >
        <span style={{ color: displayValue ? '#fff' : 'var(--gv-text-subtle)' }}>
          {displayValue || 'Pick a date'}
        </span>
        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
      </div>

      {open && (
        <div
          className="absolute z-50 mt-2 rounded-xl p-4 w-72"
          style={{
            background: 'rgba(13,21,40,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >

          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--gv-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-semibold text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--gv-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium py-1"
                style={{ color: 'var(--gv-text-subtle)' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;

              const sel   = isSelected(day);
              const todayFlag = isToday(day);

              return (
                <button
                  key={`d-${day}`}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="flex items-center justify-center rounded-lg text-sm h-8 w-8 mx-auto transition-all"
                  style={{
                    background: sel
                      ? '#33907C'
                      : todayFlag
                      ? 'rgba(51,144,124,0.15)'
                      : 'transparent',
                    color: sel
                      ? '#fff'
                      : todayFlag
                      ? '#33907C'
                      : 'var(--gv-text-muted)',
                    fontWeight: sel || todayFlag ? 600 : 400,
                    border: todayFlag && !sel ? '1px solid rgba(51,144,124,0.4)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={e => {
                    if (!sel) e.currentTarget.style.background = todayFlag ? 'rgba(51,144,124,0.15)' : 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-xs py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--gv-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fca5a5')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}