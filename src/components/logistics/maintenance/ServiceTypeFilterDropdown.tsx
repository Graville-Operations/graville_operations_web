'use client';

import { useState, useEffect, useRef } from 'react';
import { Wrench, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { VehicleServiceType, SERVICE_TYPE_LABELS } from '@/types/vehicle-service';

const TYPE_OPTIONS = Object.values(VehicleServiceType).map((value) => ({
  value,
  label: SERVICE_TYPE_LABELS[value],
}));

interface ServiceTypeFilterDropdownProps {
  value: VehicleServiceType | null;
  onChange: (type: VehicleServiceType | null) => void;
}

export default function ServiceTypeFilterDropdown({ value, onChange }: ServiceTypeFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = TYPE_OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
        style={{
          background: value ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
          border: `1px solid ${value ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: value ? '#33907c' : 'var(--gv-text-muted)',
        }}
      >
        <Wrench size={13} />
        <span className="text-xs font-medium">{selectedLabel || 'Filter by Service Type'}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-2xl z-30 overflow-hidden p-1"
          style={{
            background: '#0d1528',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ color: !value ? '#33907c' : 'var(--gv-text-muted)', background: !value ? 'rgba(51,144,124,0.1)' : 'transparent' }}
          >
            All Types
            {!value && <Check size={13} />}
          </button>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
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