import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  bordered?: boolean;
}

export function LoadMoreButton({ onClick, loading, bordered = true }: LoadMoreButtonProps) {
  return (
    <div className={bordered ? 'px-6 py-3 border border-border rounded-lg' : ''}>
      <button
        onClick={onClick}
        disabled={loading}
        className="w-full h-9 rounded-lg border border-border text-xs
                   text-muted-foreground hover:bg-accent
                   transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : 'Load more'}
      </button>
    </div>
  );
}