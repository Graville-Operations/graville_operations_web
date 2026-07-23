'use client';

import { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';
import { InvoicePaymentStatus } from '@/types/company_invoices';

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

export default function StatusFilterDropdown({ value, onChange }: StatusFilterDropdownProps) {
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
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
        style={{
          background: value ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
          border: `1px solid ${value ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: value ? '#33907c' : 'var(--gv-text-muted)',
        }}
      >
        <Filter size={13} />
        <span>{selectedLabel || 'Filter by Status'}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-30 p-1"
          style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ color: !value ? '#33907c' : 'var(--gv-text-muted)', background: !value ? 'rgba(51,144,124,0.1)' : 'transparent' }}
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
              style={{
                color: value === opt.value ? '#33907c' : 'var(--gv-text-muted)',
                background: value === opt.value ? 'rgba(51,144,124,0.1)' : 'transparent',
              }}
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