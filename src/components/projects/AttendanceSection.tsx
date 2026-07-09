'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronRight as ChevronRightIcon, RefreshCw } from 'lucide-react';
import { AttendanceTab, Bar } from '@/types/dashboard';
import { CalendarPicker } from '@/components/projects/CalendarPicker';
import { AttendanceBarChart } from '@/components/projects/AttendanceBarChart';

interface AttendanceSectionProps {
  attendanceTab: AttendanceTab;
  setAttendanceTab: (t: AttendanceTab) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  bars: Bar[];
  loadingBars: boolean;
  barsError: string | null;
  loadBars: () => void;
}
export function AttendanceSection({
  attendanceTab, setAttendanceTab, dateFrom, setDateFrom, dateTo, setDateTo,
  bars, loadingBars, barsError, loadBars,
}: AttendanceSectionProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);
  const [overlayPos, setOverlayPos]     = useState<{ top: number; left: number } | null>(null);

  const calendarRef  = useRef<HTMLDivElement>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveBarIdx(null);
    setOverlayPos(null);
  }, [attendanceTab, dateFrom, dateTo]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setShowCalendar(false);
    }
    if (showCalendar) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCalendar]);

  useEffect(() => {
    function handleClick() { setActiveBarIdx(null); setOverlayPos(null); }
    if (activeBarIdx !== null) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeBarIdx]);

  function handleBarClick(idx: number | null) {
    if (idx === null) { setActiveBarIdx(null); setOverlayPos(null); return; }
    setActiveBarIdx(idx);
    if (chartCardRef.current) {
      const rect     = chartCardRef.current.getBoundingClientRect();
      const count    = bars.length || 1;
      const fraction = (idx + 0.5) / count;
      setOverlayPos({ top: rect.top, left: rect.left + fraction * rect.width });
    }
  }

  const customLabel = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : 'Pick dates';
  const activeBar   = activeBarIdx !== null ? bars[activeBarIdx] : null;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['Today', 'Week', 'Month', 'Custom'] as const).map((t) => {
            const active = attendanceTab === t;
            return (
              <button key={t}
                onClick={() => { setAttendanceTab(t); if (t === 'Custom') setShowCalendar(true); }}
                className="text-base font-semibold px-4 py-2.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
                style={active
                  ? { background: 'var(--gv-brand)', color: '#fff' }
                  : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                {t === 'Custom' && (dateFrom || dateTo) ? customLabel : t}
              </button>
            );
          })}
        </div>

        {attendanceTab === 'Custom' && (
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-base"
              style={{
                background: 'var(--gv-glass-bg)',
                border: '1px solid var(--gv-glass-border)',
                color: dateFrom ? '#fff' : 'var(--gv-text-muted)',
              }}>
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />
              <span className="truncate">
                {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom ? `From ${dateFrom}` : 'Select range'}
              </span>
              <ChevronRightIcon className="w-3.5 h-3.5 ml-auto opacity-40 flex-shrink-0" />
            </button>
            {showCalendar && (
              <CalendarPicker
                dateFrom={dateFrom} dateTo={dateTo}
                onSelect={(from, to) => { setDateFrom(from); setDateTo(to); }}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>
        )}

        {barsError && <p className="text-base px-1" style={{ color: '#fca5a5' }}>{barsError}</p>}

        <div ref={chartCardRef} className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', position: 'relative' }}>
          <div className="flex items-center justify-end px-3 pt-2">
            <button onClick={loadBars} className="opacity-50 hover:opacity-100 transition-opacity">
              <RefreshCw className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="w-full">
            <AttendanceBarChart bars={bars} loading={loadingBars} tab={attendanceTab}
              activeBarIdx={activeBarIdx} onBarClick={handleBarClick} />
          </div>
          <div className="flex justify-end px-3 pb-3">
            <span className="flex items-center gap-1 text-base" style={{ color: 'var(--gv-text-subtle)' }}>
              <span className="w-2 h-2 rounded-sm flex-shrink-0 inline-block" style={{ background: '#3b82f6' }} />
              Present
            </span>
          </div>
        </div>
      </div>

      {attendanceTab === 'Week' && activeBar && overlayPos && (
        <div className="fixed z-50"
          style={{ top: overlayPos.top - 8, left: overlayPos.left, transform: 'translate(-50%, -100%)', pointerEvents: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-4 shadow-2xl"
            style={{ minWidth: 200, background: 'rgba(14,16,26,0.98)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(24px)' }}>
            <button onClick={() => { setActiveBarIdx(null); setOverlayPos(null); }}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-base"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>✕</button>
            <p className="text-lg font-bold text-white leading-tight pr-6">{activeBar.fullLabel}</p>
            <p className="text-base mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{activeBar.dateDisplay}</p>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: '#3b82f6' }} />
                <span className="text-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>Present</span>
              </div>
              <span className="text-3xl font-bold text-white">{activeBar.present}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}