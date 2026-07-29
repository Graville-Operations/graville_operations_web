'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { SiteWorkersList } from '@/components/workers/SiteWorkersList';
import { useSiteWorkers } from '@/hooks/workers/useSiteWorkers';
import EmptyState from '@/components/ui/emptystate';
import { ROUTES } from '@/lib/routes';
import type { Site } from '@/types/site';

const DISPLAY_LIMIT = 5;

interface WorkersBySiteSectionProps {
  sites: Site[];
  sitesLoading: boolean;
}

export function WorkersBySiteSection({ sites, sitesLoading }: WorkersBySiteSectionProps) {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const { workers, loading } = useSiteWorkers(selectedSiteId);

  const visibleWorkers = workers.slice(0, DISPLAY_LIMIT);
  const hasMore = workers.length > DISPLAY_LIMIT;

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

      <div className="gv-card p-0! overflow-hidden flex-1">
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
        ) : (
          <>
            <SiteWorkersList workers={visibleWorkers} />
            {hasMore && (
              <div className="px-4 py-2.5 border-t border-border">
                <button
                  onClick={() => router.push(ROUTES.workers.siteWorkers(selectedSiteId))}
                  className="text-sm font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
                >
                  View All ({workers.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}