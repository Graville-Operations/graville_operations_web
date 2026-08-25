'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Check, User } from 'lucide-react';

const AVAILABLE_DRIVERS = ['James Otieno', 'Peter Mwangi', 'Samuel Kiptoo'];

interface DriverSelectDropdownProps {
  value: string;
  onChange: (driver: string) => void;
}

export default function DriverSelectDropdown({ value, onChange }: DriverSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'var(--muted)',
          border: `1px solid var(--border)`,
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
        }}
      >
        <span className="flex items-center gap-2 truncate">
          <User size={13} className="shrink-0 text-[color:var(--muted-foreground)]" />
          <span className="truncate">{value || 'Unassigned'}</span>
        </span>
        {open ? <ChevronUp size={13} className="shrink-0" /> : <ChevronDown size={13} className="shrink-0" />}
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl z-30 overflow-hidden p-1 max-h-56 overflow-y-auto"
          style={{
            background: '#0d1528',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ color: !value ? '#33907c' : 'var(--gv-text-muted)', background: !value ? 'rgba(51,144,124,0.1)' : 'transparent' }}
          >
            Unassigned
            {!value && <Check size={13} />}
          </button>
          {AVAILABLE_DRIVERS.map((name) => (
            <button
              type="button"
              key={name}
              onClick={() => { onChange(name); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                color: value === name ? '#33907c' : 'var(--gv-text-muted)',
                background: value === name ? 'rgba(51,144,124,0.1)' : 'transparent',
              }}
            >
              {name}
              {value === name && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}