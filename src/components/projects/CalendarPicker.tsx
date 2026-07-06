'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { toISO } from '@/lib/utils/dashboard-helpers';

export function CalendarPicker({
  dateFrom, dateTo, onSelect, onClose,
}: {
  dateFrom: string; dateTo: string;
  onSelect: (from: string, to: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [hoverDate, setHoverDate] = useState<string>('');

  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate   = dateTo   ? new Date(dateTo)   : null;

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  function getDaysInMonth(year: number, month: number) {
    const firstDay  = new Date(year, month, 1);
    const startDow  = (firstDay.getDay() + 6) % 7;
    const daysInMo  = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= daysInMo; d++) days.push(new Date(year, month, d));
    return days;
  }

  const days = getDaysInMonth(viewYear, viewMonth);

  function handleDayClick(date: Date) {
    const iso = toISO(date);
    if (selecting === 'from') { onSelect(iso, ''); setSelecting('to'); }
    else {
      if (fromDate && date < fromDate) onSelect(iso, dateFrom);
      else onSelect(dateFrom, iso);
      setSelecting('from');
    }
  }

  function inRange(date: Date) {
    if (!fromDate) return false;
    const end = toDate ?? (hoverDate ? new Date(hoverDate) : null);
    if (!end) return false;
    const [lo, hi] = fromDate <= end ? [fromDate, end] : [end, fromDate];
    return date > lo && date < hi;
  }

  function isSelected(date: Date) {
    const iso = toISO(date);
    return iso === dateFrom || iso === dateTo;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  while (weeks[weeks.length - 1]?.length < 7) weeks[weeks.length - 1].push(null);

  return (
    <div className="absolute z-50 rounded-2xl shadow-2xl p-4 select-none"
      style={{
        background: 'rgba(18,20,30,0.98)', border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)', top: '100%', left: 0, marginTop: 8, minWidth: 280,
      }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-lg font-semibold text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ChevronRightIcon className="w-4 h-4 text-white" />
        </button>
      </div>

      <p className="text-base mb-2 text-center" style={{ color: 'var(--gv-text-muted)' }}>
        {selecting === 'from' ? 'Select start date' : 'Select end date'}
      </p>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-base font-medium py-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>{d}</div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((date, di) => {
            if (!date) return <div key={di} />;
            const selected     = isSelected(date);
            const inR          = inRange(date);
            const iso          = toISO(date);
            const isFrom       = iso === dateFrom;
            const isTo         = iso === dateTo;
            const isTodayDate  = iso === toISO(today);
            return (
              <div key={di} className="flex items-center justify-center"
                style={{
                  height: 32,
                  background: inR ? 'rgba(59,130,246,0.15)' : 'transparent',
                  borderRadius: isFrom ? '8px 0 0 8px' : isTo ? '0 8px 8px 0' : 0,
                }}
                onMouseEnter={() => setHoverDate(iso)}
                onMouseLeave={() => setHoverDate('')}
                onClick={() => handleDayClick(date)}>
                <div className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all"
                  style={{
                    background: selected ? '#3b82f6' : 'transparent',
                    border: isTodayDate && !selected ? '1px solid rgba(59,130,246,0.5)' : 'none',
                  }}>
                  <span className="text-base font-medium"
                    style={{ color: selected ? '#fff' : isTodayDate ? '#7cb3f8' : 'rgba(255,255,255,0.8)' }}>
                    {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-base" style={{ color: 'var(--gv-text-muted)' }}>
          {dateFrom && <span>From: <span className="text-white">{dateFrom}</span></span>}
          {dateTo   && <span className="ml-2">To: <span className="text-white">{dateTo}</span></span>}
        </div>
        <button onClick={onClose} className="text-base px-3 py-1 rounded-lg"
          style={{ background: '#3b82f6', color: '#fff' }}>Done</button>
      </div>
    </div>
  );
}