import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ActivityErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-16 text-center border-(--gv-border-danger)">
      <AlertTriangle size={36} className="text-destructive opacity-40 mb-3" />
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="gv-tag border-(--gv-glass-border) hover:border-(--gv-glass-border-hover) cursor-pointer flex items-center gap-1.5 transition-colors"
      >
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}

export function ActivityListEmptyState({
  icon, message, hint,
}: { icon: React.ReactNode; message: string; hint?: string }) {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <span className="text-muted-foreground opacity-40">{icon}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export function ActivityTableEmptyState({
  icon, message,
}: { icon: React.ReactNode; message: string }) {
  return (
    <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground opacity-20 mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}