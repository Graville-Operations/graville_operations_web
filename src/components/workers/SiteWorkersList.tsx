'use client';
import { UserRound } from 'lucide-react';
import type { SiteWorker } from '@/types/site';

function StatusPill({ status }: { status: string }) {
  const isActive = status?.toUpperCase() === 'ACTIVE';
  return (
    <span
      className="gv-tag"
      style={{
        color: isActive ? '#33907C' : 'var(--gv-text-subtle)',
        background: isActive ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
        border: `1px solid ${isActive ? 'rgba(51,144,124,0.35)' : 'var(--border)'}`,
      }}
    >
      {status}
    </span>
  );
}

export function SiteWorkersList({ workers }: { workers: SiteWorker[] }) {
  if (workers.length === 0) {
    return (
      <div className="gv-card flex items-center justify-center py-10">
        <p className="text-sm text-muted-foreground">No workers assigned to this site yet.</p>
      </div>
    );
  }

  return (
    <div className="gv-card divide-y divide-border p-0!">
      {workers.map(w => (
        <div key={w.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="gv-icon-box"><span className="text-primary"><UserRound size={16} /></span></div>
            <div>
              <p className="text-sm font-medium text-foreground">{w.first_name} {w.last_name}</p>
              <p className="text-xs text-muted-foreground">{w.skill?.name ?? 'No skill assigned'}</p>
            </div>
          </div>
          <StatusPill status={w.status} />
        </div>
      ))}
    </div>
  );
}