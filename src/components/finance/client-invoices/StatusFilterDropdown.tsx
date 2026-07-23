import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Filter, Check } from 'lucide-react';
import { InvoicePaymentStatus } from '@/types/client-invoice';

const STATUS_OPTIONS: { value: InvoicePaymentStatus; label: string }[] = [
  { value: InvoicePaymentStatus.PENDING, label: 'Pending' },
  { value: InvoicePaymentStatus.PARTIALLY_PAID, label: 'Partially Paid' },
  { value: InvoicePaymentStatus.PAID, label: 'Paid' },
  { value: InvoicePaymentStatus.REJECTED, label: 'Rejected' },
];

interface StatusFilterDropdownProps {
  value: InvoicePaymentStatus | null;
  onChange: (status: InvoicePaymentStatus | null) => void;
}

export function StatusFilterDropdown({ value, onChange }: StatusFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = STATUS_OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div className="relative shrink-0" ref={ref}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen((p) => !p)}
          className={`gv-btn-pill gap-2 ${value ? 'gv-pill-active' : ''}`}
        >
          <Filter size={13} />
          <span>{selectedLabel || 'Filter by Status'}</span>
          <ChevronDown
            size={13}
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </button>
        {value && (
          <button
            onClick={() => onChange(null)}
            className="p-1 rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="gv-dropdown" style={{ width: '13rem', left: 'auto', right: 0, padding: '0.5rem' }}>
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ color: !value ? 'var(--gv-brand)' : 'var(--gv-text-muted)' }}
          >
            All Statuses
            {!value && <Check size={13} />}
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ color: value === opt.value ? 'var(--gv-brand)' : 'var(--gv-text-muted)' }}
            >
              {opt.label}
              {value === opt.value && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}