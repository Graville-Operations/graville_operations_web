'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { DateMode } from '@/hooks/subcontractor-invoices/useSubcontractorInvoices';

const DATE_POPUP_WIDTH = 288;
const VIEWPORT_MARGIN = 16;

interface DateFilterDropdownProps {
  dateMode: DateMode;
  setDateMode: (mode: DateMode) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  hasDateFilter: boolean;
  clearDateFilter: () => void;
}

export function DateFilterDropdown({
  dateMode,
  setDateMode,
  dateFilter,
  setDateFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  hasDateFilter,
  clearDateFilter,
}: DateFilterDropdownProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const datePortalRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const computePosition = () => {
    if (!dateBtnRef.current) return;
    const rect = dateBtnRef.current.getBoundingClientRect();
    const maxLeft = window.innerWidth - DATE_POPUP_WIDTH - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)) + window.scrollX;
    setPickerPos({ top: rect.bottom + window.scrollY + 8, left });
  };

  const openDatePicker = () => {
    computePosition();
    setShowDatePicker(true);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = datePickerRef.current?.contains(target);
      const insidePortal = datePortalRef.current?.contains(target);
      if (!insideTrigger && !insidePortal) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!showDatePicker) return;
    window.addEventListener('resize', computePosition);
    return () => window.removeEventListener('resize', computePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDatePicker]);

  const dateBtnLabel = () => {
    if (dateMode === 'single' && dateFilter)
      return new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    if (dateMode === 'range') {
      if (dateFrom && dateTo)
        return `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} – ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      if (dateFrom)
        return `From ${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`;
      if (dateTo)
        return `To ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`;
    }
    return 'Filter by Date';
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        ref={dateBtnRef}
        type="button"
        onClick={() => (showDatePicker ? setShowDatePicker(false) : openDatePicker())}
        className={`flex items-center gap-2 border rounded-lg text-sm px-3 py-2 transition-colors cursor-pointer select-none
          ${hasDateFilter
            ? 'bg-[#33907C]/20 border-[#33907C]/50 text-white'
            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15 hover:border-white/30'}
          focus:outline-none focus:ring-2 focus:ring-[#33907C]`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 opacity-70"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{dateBtnLabel()}</span>
        <ChevronDown
          size={12}
          className={`opacity-50 transition-transform ${showDatePicker ? 'rotate-180' : ''}`}
        />
      </button>

      {showDatePicker &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={datePortalRef}
            style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 99999 }}
            className="w-72 bg-[#0d1b2a] border border-white/20 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)] p-4 space-y-4"
          >
            <div className="flex rounded-lg overflow-hidden border border-white/20 text-sm font-medium">
              {(['single', 'range'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setDateMode(m);
                    clearDateFilter();
                  }}
                  className={`flex-1 py-2 transition-colors capitalize
                    ${dateMode === m
                      ? 'bg-[#33907C] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'}`}
                >
                  {m === 'single' ? 'Single Date' : 'Date Range'}
                </button>
              ))}
            </div>

            {dateMode === 'single' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  max={today}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                             text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33907C]
                             scheme-dark cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || today}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                               text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33907C]
                               scheme-dark cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    max={today}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                               text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33907C]
                               scheme-dark cursor-pointer"
                  />
                </div>
              </div>
            )}

            {dateMode === 'range' && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Last 7 days', days: 7 },
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 90 days', days: 90 },
                ].map(({ label, days }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const t = new Date();
                      const f = new Date();
                      f.setDate(f.getDate() - days);
                      setDateTo(t.toISOString().split('T')[0]);
                      setDateFrom(
                        days === 0 ? t.toISOString().split('T')[0] : f.toISOString().split('T')[0],
                      );
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#33907C]/30
                               hover:text-white text-white/50 border border-white/10 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  clearDateFilter();
                  setShowDatePicker(false);
                }}
                className="flex-1 py-2 text-sm text-white/50 hover:text-white bg-white/5
                           hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="flex-1 py-2 text-sm text-white font-semibold bg-[#33907C]
                           hover:bg-[#2a7566] rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}