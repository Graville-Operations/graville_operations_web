'use client';

import { ChevronDown } from 'lucide-react';
import type { SiteOption } from '@/types/subcontractor-invoice';

const SELECT_BG = '#0f1f2e';

interface SiteFilterDropdownProps {
  sites: SiteOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SiteFilterDropdown({ sites, value, onChange }: SiteFilterDropdownProps) {
  return (
    <div className="relative min-w-45">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ backgroundColor: SELECT_BG, colorScheme: 'dark' }}
        className="w-full appearance-none border border-white/20 rounded-lg
                   text-sm text-white/70 px-3 py-2 pr-8
                   focus:outline-none focus:ring-2 focus:ring-[#33907C]
                   cursor-pointer"
      >
        <option value="" style={{ backgroundColor: SELECT_BG, color: '#fff' }}>
          All Sites
        </option>
        {sites.map((s) => (
          <option
            key={s.id}
            value={String(s.id)}
            style={{ backgroundColor: SELECT_BG, color: '#fff' }}
          >
            {s.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
    </div>
  );
}