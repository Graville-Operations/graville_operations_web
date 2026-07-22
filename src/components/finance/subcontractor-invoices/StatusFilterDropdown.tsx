'use client';

import { ChevronDown } from 'lucide-react';

const SELECT_BG = '#0f1f2e';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REJECTED', label: 'Rejected' },
];

interface StatusFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilterDropdown({ value, onChange }: StatusFilterDropdownProps) {
  return (
    <div className="relative min-w-40">
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
          All Statuses
        </option>
        {STATUS_OPTIONS.map((s) => (
          <option
            key={s.value}
            value={s.value}
            style={{ backgroundColor: SELECT_BG, color: '#fff' }}
          >
            {s.label}
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