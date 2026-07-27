import { ChevronDown } from 'lucide-react';
import type { Site } from '@/types/store';

interface SiteSelectorProps {
  sites: Site[];
  selectedSiteId: number | null;
  onChange: (id: number) => void;
  isLoading: boolean;
}

export function SiteSelector({ sites, selectedSiteId, onChange, isLoading }: SiteSelectorProps) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-64">
      <p className="gv-label">select site</p>
      {isLoading ? (
        <div className="h-10 rounded-lg bg-(--gv-glass-bg) relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                          bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ) : (
        <div className="relative">
          <select
            className="w-full appearance-none pr-9 pl-3 h-10 rounded-lg border border-border
                       bg-(--gv-glass-bg) text-foreground text-sm cursor-pointer
                       outline-none transition-colors focus:border-(--gv-glass-border-hover)
                       hover:border-(--gv-glass-border) [&>option]:bg-[#0d1528] [&>option]:text-white"
            value={selectedSiteId ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {sites.length === 0 && <option value="">No sites available</option>}
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-(--gv-text-subtle) pointer-events-none" />
        </div>
      )}
    </div>
  );
}