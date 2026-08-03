import { Search, Package, Wrench } from 'lucide-react';
import { StockTab } from '@/types/enums/stock-tab';

interface StockToolbarProps {
  tab: StockTab;
  onTabChange: (t: StockTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
}


const TABS: StockTab[] = [StockTab.MATERIALS, StockTab.TOOLS];

export function StockToolbar({ tab, onTabChange, search, onSearchChange }: StockToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex gap-1 p-1 rounded-lg bg-muted">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
              tab === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'materials' ? <Package size={14} /> : <Wrench size={14} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="gv-input pl-9 h-9 text-sm"
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}