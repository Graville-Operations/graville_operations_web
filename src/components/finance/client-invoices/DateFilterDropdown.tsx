import { RefObject } from 'react';
import { ChevronDown, X, Calendar } from 'lucide-react';
import { DateFilterMode } from '@/types/client-invoice';

interface DateFilterDropdownProps {
  calendarRef: RefObject<HTMLDivElement | null>;
  calendarOpen: boolean;
  onToggle: () => void;
  activeDateLabel: string;
  dateMode: DateFilterMode;
  setDateMode: (mode: DateFilterMode) => void;
  singleDate: string;
  setSingleDate: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  today: string;
  onApply: () => void;
  onClear: () => void;
}

export function DateFilterDropdown({
  calendarRef, calendarOpen, onToggle, activeDateLabel,
  dateMode, setDateMode, singleDate, setSingleDate,
  dateFrom, setDateFrom, dateTo, setDateTo, today,
  onApply, onClear,
}: DateFilterDropdownProps) {
  const canApply = dateMode === 'single' ? !!singleDate : !!dateFrom && !!dateTo;

  return (
    <div className="relative shrink-0" ref={calendarRef}>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
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
            onClick={onClear}
            className="p-1 rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {calendarOpen && (
        <div className="gv-dropdown" style={{ width: '20rem', left: 'auto', right: 0, padding: '1.25rem', overflow: 'visible' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '9999px',
              padding: '3px',
              marginBottom: '1.25rem',
            }}
          >
            {(['single', 'range'] as DateFilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDateMode(mode)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  background: dateMode === mode ? 'var(--gv-brand)' : 'transparent',
                  color: dateMode === mode ? '#ffffff' : 'var(--gv-text-muted)',
                }}
              >
                {mode === 'single' ? 'Single Date' : 'Date Range'}
              </button>
            ))}
          </div>

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
                className="gv-input"
                style={{ colorScheme: 'dark' as never }}
              />
            </div>
          )}

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
                  className="gv-input"
                  style={{ colorScheme: 'dark' as never }}
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
                  className="gv-input"
                  style={{ colorScheme: 'dark' as never }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClear} className="gv-btn-ghost flex-1">
              Clear
            </button>
            <button
              onClick={onApply}
              disabled={!canApply}
              className="gv-btn-brand flex-1"
              style={{ opacity: canApply ? 1 : 0.4 }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}