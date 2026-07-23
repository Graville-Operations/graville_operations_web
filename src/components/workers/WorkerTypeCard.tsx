'use client';
import { Wallet } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import type { WorkerType } from '@/types/worker-dashboard';

function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface WorkerTypesCardProps {
  workerTypes: WorkerType[];
  loading: boolean;
  onAdd: () => void;
}

export function WorkerTypesCard({ workerTypes, loading, onAdd }: WorkerTypesCardProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-lg font-semibold text-foreground">Worker Types</h2>
      <div className="gv-card p-0 overflow-hidden flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
            ))}
          </div>
        ) : workerTypes.length === 0 ? (
          <EmptyState
            title="No worker types yet"
            description="Add a worker type to start categorizing your workforce and rates."
            action={{ label: 'Add Worker Type', onClick: onAdd }}
            fullScreen={false}
          />
        ) : (
          <div className="divide-y divide-border">
            {workerTypes.map(wt => (
              <div key={wt.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="gv-icon-box shrink-0"><span className="text-primary"><Wallet size={16} /></span></div>
                  <p className="text-sm font-medium text-foreground truncate">{wt.name}</p>
                </div>
                <p className="text-sm font-semibold text-foreground shrink-0">{fmtKES(wt.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}