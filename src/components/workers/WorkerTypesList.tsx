'use client';
import { Wallet } from 'lucide-react';
import type { WorkerType } from '@/types/worker-dashboard';

function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function WorkerTypesList({ workerTypes }: { workerTypes: WorkerType[] }) {
  if (workerTypes.length === 0) {
    return (
      <div className="gv-card flex items-center justify-center py-10">
        <p className="text-sm text-muted-foreground">No worker types yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="gv-card divide-y divide-border p-0!">
      {workerTypes.map(wt => (
        <div key={wt.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><span className="text-primary"><Wallet size={16} /></span></div>
            <div>
              <p className="text-sm font-medium text-foreground">{wt.name}</p>
              <p className="text-xs text-muted-foreground">{wt.skill}</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground">{fmtKES(wt.amount)}</p>
        </div>
      ))}
    </div>
  );
}