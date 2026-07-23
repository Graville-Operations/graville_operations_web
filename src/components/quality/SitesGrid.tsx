'use client';

import type { Site } from '@/lib/sites-cache';
import { getAccentColor } from '@/lib/utils/task-status';
import EmptyState from '@/components/ui/emptystate';
import SiteCard from './SiteCard';

const GRID_STYLE = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' } as const;

interface SitesGridProps {
  sites: Site[];
  loading: boolean;
  error: string | null;
  onSelect: (site: Site) => void;
  onRetry: () => void;
}

export default function SitesGrid({ sites, loading, error, onSelect, onRetry }: SitesGridProps) {
  if (loading && sites.length === 0) {
    return (
      <div style={GRID_STYLE}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-(--gv-glass-bg) animate-pulse" />
        ))}
      </div>
    );
  }

  if (!loading && error && sites.length === 0) {
    return (
      <EmptyState
        fullScreen={false}
        title="Couldn't load sites"
        description={error}
        action={{ label: 'Retry', onClick: onRetry }}
      />
    );
  }

  if (!loading && !error && sites.length === 0) {
    return (
      <EmptyState
        fullScreen={false}
        title="No sites found"
        description="There are no construction sites to show yet."
      />
    );
  }

  return (
    <div style={GRID_STYLE}>
      {sites.map((site, idx) => (
        <SiteCard key={site.id} site={site} accent={getAccentColor(idx)} onSelect={onSelect} />
      ))}
    </div>
  );
}