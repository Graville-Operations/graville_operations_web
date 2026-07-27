'use client';
import { useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useWorkersBySite } from '@/hooks/workers/useWorkersBySite';
import type { Site } from '@/types/store';

interface WorkersBySiteSectionProps {
  sites: Site[];
  sitesLoading: boolean;
}

export function WorkersBySiteSection({ sites, sitesLoading }: WorkersBySiteSectionProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const { workers, total, loading } = useWorkersBySite(selectedSiteId);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Workers</h2>
        <div className="relative">
          <select
            disabled={sitesLoading}
            className="appearance-none pr-8 pl-3 h-9 rounded-lg border border-border bg-(--gv-glass-bg) text-foreground text-sm cursor-pointer outline-none transition-colors focus:border-primary hover:border-(--gv-glass-border) disabled:opacity-60 disabled:cursor-not-allowed [&>option]:bg-[#0d1528] [&>option]:text-white"
            value={selectedSiteId ?? ''}
            onChange={(e) => setSelectedSiteId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select site</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--gv-text-subtle) pointer-events-none" />
        </div>
      </div>

      <div className="gv-card p-0 overflow-hidden flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
            ))}
          </div>
        ) : !selectedSiteId ? (
          <EmptyState
            title="No site selected"
            description="Select a site above to view its workers."
            fullScreen={false}
          />
        ) : workers.length === 0 ? (
          <EmptyState
            title="No workers on this site"
            description="Workers checked in at this site will show up here."
            fullScreen={false}
          />
        ) : (
          <>
            <div className="divide-y divide-border">
              {workers.map(w => (
                <div key={w.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="gv-icon-box shrink-0"><span className="text-primary"><Users size={16} /></span></div>
                    <p className="text-sm font-medium text-foreground truncate">{w.first_name} {w.last_name}</p>
                  </div>
                  <span className="gv-tag text-(--gv-text-subtle) shrink-0">{w.status}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border">
              <p className="text-xs text-muted-foreground">{total} worker{total !== 1 ? 's' : ''} on this site</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}