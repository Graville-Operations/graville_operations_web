import { AlertTriangle, XCircle, CheckCircle2, Clock, AlertOctagon } from 'lucide-react';

interface StockSummaryBadgesProps {
  materialCount: number;
  toolCount:     number;
  lowCount:      number;
  outCount:      number;
  availTool:     number;
  overdueTool:   number;
  damagedTools:  number;
}

export function StockSummaryBadges({
  materialCount, toolCount, lowCount, outCount, availTool, overdueTool, damagedTools,
}: StockSummaryBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="gv-tag">
        {materialCount} material{materialCount !== 1 ? 's' : ''}
      </span>
      {lowCount > 0 && (
        <span className="gv-tag border-(--gv-border-warn) text-(--gv-text-warn) flex items-center gap-1">
          <AlertTriangle size={10} /> {lowCount} low stock
        </span>
      )}
      {outCount > 0 && (
        <span className="gv-tag border-(--gv-border-danger) text-destructive flex items-center gap-1">
          <XCircle size={10} /> {outCount} out of stock
        </span>
      )}
      <span className="gv-tag">
        {toolCount} tool{toolCount !== 1 ? 's' : ''}
      </span>
      {availTool > 0 && (
        <span className="gv-tag flex items-center gap-1">
          <CheckCircle2 size={10} /> {availTool} available
        </span>
      )}
      {overdueTool > 0 && (
        <span className="gv-tag flex items-center gap-1">
          <Clock size={10} /> {overdueTool} overdue
        </span>
      )}
      {damagedTools > 0 && (
        <span className="gv-tag border-(--gv-border-danger) text-destructive flex items-center gap-1">
          <AlertOctagon size={10} /> {damagedTools} damaged
        </span>
      )}
    </div>
  );
}