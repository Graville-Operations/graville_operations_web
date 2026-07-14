'use client';

import { useQualitySites } from '@/hooks/quality/useQualitySites';
import OfflineBanner from '@/components/quality/OfflineBanner';
import SitesGrid from '@/components/quality/SitesGrid';

export default function QualitySitesPage() {
  const { sites, loading, error, offline, loadSites, openSite } = useQualitySites();

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--gv-text-primary) tracking-tight">Quality</h1>
          <p className="gv-eyebrow mt-0.5">
            {loading ? 'Loading…' : `${sites.length} site${sites.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-4">
        {offline && <OfflineBanner message="You're offline — showing cached data." />}

        <SitesGrid
          sites={sites}
          loading={loading}
          error={error}
          onSelect={openSite}
          onRetry={loadSites}
        />
      </div>
    </div>
  );
}