import { Calendar } from 'lucide-react';

interface ActivityDateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

export function ActivityDateRangeFilter({
  startDate, endDate, onStartChange, onEndChange,
}: ActivityDateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="gv-label">Date range</p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="pl-8 pr-3 h-10 rounded-lg border border-border
                       bg-(--gv-glass-bg) text-foreground text-sm
                       outline-none transition-colors focus:border-(--gv-glass-border-hover)
                       hover:border-(--gv-glass-border) cursor-pointer"
          />
        </div>
        <span className="text-xs text-muted-foreground">to</span>
        <div className="relative">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="pl-8 pr-3 h-10 rounded-lg border border-border
                       bg-(--gv-glass-bg) text-foreground text-sm
                       outline-none transition-colors focus:border-(--gv-glass-border-hover)
                       hover:border-(--gv-glass-border) cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}