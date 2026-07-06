import { ChevronDown } from 'lucide-react';
import type { Site } from '@/types/store';

interface ActivitySiteFilterProps {
  sites: Site[];
  selectedSiteId: number | null;
  onChange: (id: number | null) => void;
  isLoading: boolean;
}

export function ActivitySiteFilter({ sites, selectedSiteId, onChange, isLoading }: ActivitySiteFilterProps) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-64">
      <p className="gv-label">Filter by site</p>
      {isLoading ? (
        <div className="h-10 rounded-lg bg-(--gv-glass-bg) relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ) : (
        <div className="relative">
          <select
            className="w-full appearance-none pr-9 pl-3 h-10 rounded-lg border border-border
                       bg-(--gv-glass-bg) text-foreground text-sm cursor-pointer
                       outline-none transition-colors focus:border-(--gv-glass-border-hover)
                       hover:border-(--gv-glass-border) [&>option]:bg-[#0d1528] [&>option]:text-white"
            value={selectedSiteId ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="">All Sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gv-text-subtle) pointer-events-none" />
        </div>
      )}
    </div>
  );
}