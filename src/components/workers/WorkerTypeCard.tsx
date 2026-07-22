'use client';
import { Wallet } from 'lucide-react';
import type { WorkerType } from '@/types/worker-dashboard';

function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function WorkerTypeCard({ workerType }: { workerType: WorkerType }) {
  return (
    <div className="gv-card flex flex-col gap-4 border-border">
      <div className="flex items-start justify-between">
        <div className="gv-icon-box"><span className="text-primary"><Wallet size={18} /></span></div>
        <span className="gv-tag text-(--gv-text-subtle)">{workerType.skill}</span>
      </div>
      <div>
        <p className="gv-label">{workerType.name}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">{fmtKES(workerType.amount)}</p>
      </div>
    </div>
  );
}