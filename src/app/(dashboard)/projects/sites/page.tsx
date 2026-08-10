'use client';

import { useRouter } from 'next/navigation';
import { Search, AlertCircle, Building2 } from 'lucide-react';
import { ProjectStatus } from '@/types/site';
import { useConstructionSites } from '@/hooks/sites/useConstructionSites';
import { QuickStatPill } from '@/components/sites/QuickStatPill';
import { SiteCard } from '@/components/sites/SiteCard';
import { ROUTES } from '@/lib/routes';

export default function ConstructionSitesPage() {
  const router = useRouter();
  const {
    sites, filtered, loadingSites, loadingKpis, sitesError,
    search, setSearch, projectFilter, setProjectFilter,
    load, stats,
  } = useConstructionSites();

  return (
    <div className="gv-page-dashboard flex flex-col gap-0 overflow-y-auto pb-10">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-white">Construction Sites</h1>
        <p className="text-base mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
          Overview of all active and completed projects
        </p>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-5 gap-2">
          <QuickStatPill label="Total"  value={stats.totalSites}    loading={loadingKpis} />
          <QuickStatPill label="Plan"   value={stats.planningSites} loading={loadingKpis} />
          <QuickStatPill label="Active" value={stats.activeSites}   loading={loadingKpis} />
          <QuickStatPill label="Done"   value={stats.doneSites}     loading={loadingKpis} />
          <QuickStatPill label="Paused" value={stats.pausedSites}   loading={loadingKpis} />
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--gv-text-faint)' }} />
          <input type="text" placeholder="Search by name or location..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="gv-input pl-10 w-full" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {([
            { label: 'All',       value: 'ALL'         },
            { label: 'Planning',  value: 'PLANNING'    },
            { label: 'On-going',  value: 'IN_PROGRESS' },
            { label: 'Completed', value: 'COMPLETED'   },
            { label: 'Paused',    value: 'ON_HOLD'     },
            { label: 'Cancelled', value: 'CANCELLED'   },
          ] as const).map((f) => {
            const active = projectFilter === f.value;
            return (
              <button key={f.value}
                onClick={() => setProjectFilter(f.value as ProjectStatus | 'ALL')}
                className="text-base font-medium px-4 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all"
                style={active
                  ? { background: 'white', color: '#0b1120' }
                  : { background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      {sitesError && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl px-4 py-3 text-base"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{sitesError}
          <button onClick={load} className="ml-auto underline text-sm">Retry</button>
        </div>
      )}
      {loadingSites ? (
        <div className="px-4 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="gv-icon-box w-14 h-14 mb-4" style={{ opacity: 0.4 }}>
            <Building2 className="w-7 h-7" style={{ color: 'var(--gv-brand)' }} />
          </div>
          <p className="text-base font-medium text-white">
            {sites.length === 0 ? 'No sites yet' : 'No results found'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>
            {sites.length === 0 ? 'Create your first project to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {filtered.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onClick={() => router.push(ROUTES.projects.siteDetail(site.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}