import { AlertTriangle, RefreshCw } from 'lucide-react';

interface StockErrorStateProps {
  label: string;
  onRetry: () => void;
}

export function StockErrorState({ label, onRetry }: StockErrorStateProps) {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-16 text-center border-[color:var(--gv-border-danger)]">
      <AlertTriangle size={36} className="text-destructive opacity-40 mb-3" />
      <p className="text-sm text-muted-foreground mb-3">
        Failed to load {label}. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="gv-tag border-(--gv-glass-border) hover:border-(--gv-glass-border-hover)
                   cursor-pointer flex items-center gap-1.5 transition-colors"
      >
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}