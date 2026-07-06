'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Site } from '@/lib/api/supplier-invoices';

interface SiteFilterDropdownProps {
  sites: Site[];
  value: string;
  onChange: (val: string) => void;
}

export default function SiteFilterDropdown({ sites, value, onChange }: SiteFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = sites.find((s) => String(s.id) === value);

  return (
    <div className="relative shrink-0" ref={ref} style={{ width: '150px' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl text-sm"
        style={{
          background: value ? 'rgba(51,144,124,0.08)' : 'var(--gv-glass-bg)',
          border: `1px solid ${value ? 'rgba(51,144,124,0.4)' : 'var(--gv-glass-border)'}`,
          color: value ? 'var(--gv-text-primary)' : 'var(--gv-text-muted)',
        }}
      >
        <span className="truncate text-xs">{selected?.name ?? 'All Sites'}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--gv-text-subtle)' }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-full rounded-2xl z-30 overflow-hidden"
          style={{
            background: '#0d1528',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs transition-colors"
            style={{
              background: !value ? 'rgba(51,144,124,0.15)' : 'transparent',
              color: !value ? '#33907c' : 'var(--gv-text-muted)',
              borderBottom: '1px solid var(--gv-glass-border)',
            }}
            onMouseEnter={(e) => {
              if (value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              if (value) e.currentTarget.style.background = 'transparent';
            }}
          >
            All Sites
          </button>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onChange(String(s.id));
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                style={{
                  background: String(s.id) === value ? 'rgba(51,144,124,0.15)' : 'transparent',
                  color: String(s.id) === value ? '#33907c' : 'var(--gv-text-muted)',
                }}
                onMouseEnter={(e) => {
                  if (String(s.id) !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (String(s.id) !== value) e.currentTarget.style.background = 'transparent';
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}