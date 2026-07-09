'use client';

import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        type="text"
        placeholder="Search by invoice no or subcontractor..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-[#33907C]
                   text-sm text-white placeholder-white/30"
      />
    </div>
  );
}