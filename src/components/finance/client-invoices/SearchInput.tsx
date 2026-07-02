import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--gv-text-faint)' }}
      />
      <input
        type="text"
        placeholder="Search by invoice number or client name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="gv-input pl-10"
      />
    </div>
  );
}