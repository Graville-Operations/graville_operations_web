'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { fetchSites, fetchOverviewKPIs } from '@/lib/api/sites';
import { Site, ProjectStatus, SiteStatus, OverviewKPIs } from '@/types/site';
import {
  MapPin, Search, Calendar, Tag, Building2,
  RefreshCw, AlertCircle, Layers, ChevronRight,
  Loader2, Users, ClipboardList, FileText,
  Shield, Star, ArrowLeftRight, UserCheck,
  X, Hash, Clock, Navigation, User,
} from 'lucide-react';

const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  PLANNING:    { label: 'Planning',    color: 'text-blue-300',   bg: 'bg-blue-500/15 border border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-green-300',  bg: 'bg-green-500/15 border border-green-500/30' },
  ON_HOLD:     { label: 'On Hold',     color: 'text-yellow-300', bg: 'bg-yellow-500/15 border border-yellow-500/30' },
  COMPLETED:   { label: 'Completed',   color: 'text-teal-300',   bg: 'bg-teal-500/15 border border-teal-500/30' },
  CANCELLED:   { label: 'Cancelled',   color: 'text-red-300',    bg: 'bg-red-500/15 border border-red-500/30' },
};

const SITE_STATUS_META: Record<SiteStatus, { label: string; dot: string }> = {
  ACTIVE:   { label: 'Active',   dot: 'bg-green-400' },
  INACTIVE: { label: 'Inactive', dot: 'bg-gray-400' },
  CLOSED:   { label: 'Closed',   dot: 'bg-red-400' },
};

const PROJECT_FILTERS: { label: string; value: ProjectStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Planning',    value: 'PLANNING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'On Hold',     value: 'ON_HOLD' },
  { label: 'Completed',   value: 'COMPLETED' },
  { label: 'Cancelled',   value: 'CANCELLED' },
];

function StatCard({
  label, value, sub, icon: Icon, loading,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon?: React.ElementType;
  loading?: boolean;
}) {
  return (
    <div className="gv-card gv-stat-card flex items-start gap-3">
      {Icon && (
        <div className="gv-icon-box">
          <Icon className="w-4 h-4" style={{ color: 'var(--gv-brand)' }} />
        </div>
      )}
      <div className="min-w-0">
        <p className="gv-label">{label}</p>
        {loading
          ? <div className="h-7 w-12 rounded-md animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
          : <p className="text-2xl font-semibold text-white">{value}</p>
        }
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-subtle)' }}>{sub}</p>}
      </div>
    </div>
  );
}

function SiteCard({ site, onClick }: { site: Site; onClick: () => void }) {
  const projMeta = PROJECT_STATUS_META[site.project_status] ?? PROJECT_STATUS_META['PLANNING'];
  const siteMeta = SITE_STATUS_META[site.site_status]       ?? SITE_STATUS_META['INACTIVE'];

  return (
    <div onClick={onClick} className="gv-card gv-card-hover flex flex-col gap-3 group">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="gv-icon-box">
            <Building2 className="w-4 h-4" style={{ color: 'var(--gv-brand)' }} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-white leading-tight truncate group-hover:text-(--gv-brand) transition-colors">
              {site.name}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${siteMeta.dot}`} />
              {siteMeta.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${projMeta.bg} ${projMeta.color}`}>
            {projMeta.label}
          </span>
          <ChevronRight className="w-3.5 h-3.5 transition-colors" style={{ color: 'var(--gv-text-faint)' }} />
        </div>
      </div>

      {/* body */}
      <div className="space-y-1.5 flex-1">
        {site.location && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gv-text-muted)' }}>
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{site.location}</span>
          </div>
        )}
        {site.inquiring_entity && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gv-text-muted)' }}>
            <Layers className="w-3 h-3 shrink-0" />
            <span className="truncate">{site.inquiring_entity}</span>
          </div>
        )}
        {site.description && (
          <p className="text-xs line-clamp-2" style={{ color: 'var(--gv-text-subtle)' }}>
            {site.description}
          </p>
        )}
        {site.tags && site.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {site.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="gv-tag inline-flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
            {site.tags.length > 3 && (
              <span className="text-[11px]" style={{ color: 'var(--gv-text-faint)' }}>+{site.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--gv-text-subtle)' }}>
          <Calendar className="w-3 h-3" />
          {site.created_at ? format(new Date(site.created_at), 'dd MMM yyyy') : '—'}
        </div>
        {site.completion_date && (
          <span className="text-[11px]" style={{ color: 'var(--gv-text-subtle)' }}>
            Due {format(new Date(site.completion_date), 'dd MMM yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--gv-text-muted)' }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--gv-text-subtle)' }}>{label}</p>
        <div className="text-sm font-medium text-white wrap-break-word">{value}</div>
      </div>
    </div>
  );
}

function SiteDetailPanel({ site, onClose }: { site: Site; onClose: () => void }) {
  const projMeta = PROJECT_STATUS_META[site.project_status] ?? PROJECT_STATUS_META['PLANNING'];
  const siteMeta = SITE_STATUS_META[site.site_status]       ?? SITE_STATUS_META['INACTIVE'];

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />

      {/* panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col overflow-hidden"
        style={{ background: 'var(--gv-nav-bg)', borderLeft: '1px solid var(--gv-glass-border)', backdropFilter: 'blur(24px)' }}>

        {/* panel header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="gv-icon-box">
              <Building2 className="w-5 h-5" style={{ color: 'var(--gv-brand)' }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-white leading-tight truncate">{site.name}</h2>
              <span className="inline-flex items-center gap-1.5 text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
                <span className={`w-1.5 h-1.5 rounded-full ${siteMeta.dot}`} />
                {siteMeta.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${projMeta.bg} ${projMeta.color}`}>
              {projMeta.label}
            </span>
            <button onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
              style={{ color: 'var(--gv-text-muted)', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {site.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gv-text-muted)' }}>
              {site.description}
            </p>
          )}

          {/* basic info */}
          <div>
            <p className="gv-eyebrow mb-2">Basic Information</p>
            <div className="gv-card" style={{ padding: '0 1rem' }}>
              {site.location && <DetailRow icon={MapPin} label="Location" value={site.location} />}
              <DetailRow icon={Calendar} label="Created"
                value={site.created_at ? format(new Date(site.created_at), 'dd MMM yyyy, HH:mm') : '—'} />
              {site.updated_at && (
                <DetailRow icon={Clock} label="Last updated"
                  value={format(new Date(site.updated_at), 'dd MMM yyyy, HH:mm')} />
              )}
              {site.completion_date && (
                <DetailRow icon={Calendar} label="Completion date"
                  value={format(new Date(site.completion_date), 'dd MMM yyyy')} />
              )}
              <DetailRow icon={Hash} label="Site ID" value={`#${site.id}`} />
            </div>
          </div>

          {/* entity details */}
          {(site.tender_name || site.inquiring_entity) && (
            <div>
              <p className="gv-eyebrow mb-2">Entity Details</p>
              <div className="gv-card" style={{ padding: '0 1rem' }}>
                {site.tender_name && <DetailRow icon={FileText} label="Tender name" value={site.tender_name} />}
                {site.inquiring_entity && <DetailRow icon={Layers} label="Inquiring entity" value={site.inquiring_entity} />}
              </div>
            </div>
          )}

          {/* coordinates */}
          {(site.latitude !== null || site.longitude !== null) && (
            <div>
              <p className="gv-eyebrow mb-2">Geo Coordinates</p>
              <div className="gv-card" style={{ padding: '0 1rem' }}>
                {site.latitude !== null && <DetailRow icon={Navigation} label="Latitude" value={site.latitude} />}
                {site.longitude !== null && <DetailRow icon={Navigation} label="Longitude" value={site.longitude} />}
              </div>
            </div>
          )}

          {/* tags */}
          {site.tags && site.tags.length > 0 && (
            <div>
              <p className="gv-eyebrow mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {site.tags.map((tag) => (
                  <span key={tag} className="gv-tag inline-flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* system */}
          <div>
            <p className="gv-eyebrow mb-2">System</p>
            <div className="gv-card" style={{ padding: '0 1rem' }}>
              <DetailRow icon={User} label="Created by" value={`User #${site.created_by}`} />
              {site.updated_by && <DetailRow icon={User} label="Last updated by" value={`User #${site.updated_by}`} />}
              {site.field_operator_id && <DetailRow icon={User} label="Field operator" value={`User #${site.field_operator_id}`} />}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function ProjectsDashboardPage() {
  const [sites, setSites]               = useState<Site[]>([]);
  const [kpis, setKpis]                 = useState<OverviewKPIs | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingKpis, setLoadingKpis]   = useState(true);
  const [sitesError, setSitesError]     = useState<string | null>(null);
  const [kpisError, setKpisError]       = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [siteFilter, setSiteFilter]       = useState<SiteStatus | 'ALL'>('ALL');
  const [selectedSite, setSelectedSite]   = useState<Site | null>(null);

  const loadAll = useCallback(() => {
    setLoadingSites(true);
    setSitesError(null);
    fetchSites()
      .then(setSites)
      .catch((err: unknown) =>
        setSitesError(err instanceof Error ? err.message : 'Failed to load sites')
      )
      .finally(() => setLoadingSites(false));

    setLoadingKpis(true);
    setKpisError(null);
    fetchOverviewKPIs()
      .then((res) => {
        const kpiData = (res as unknown as { data?: OverviewKPIs }).data ?? res;
        setKpis(kpiData as OverviewKPIs);
      })
      .catch((err: unknown) =>
        setKpisError(err instanceof Error ? err.message : 'Failed to load analytics')
      )
      .finally(() => setLoadingKpis(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedSite(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = sites.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(q) ||
      (s.location ?? '').toLowerCase().includes(q) ||
      (s.inquiring_entity ?? '').toLowerCase().includes(q);
    const matchProject = projectFilter === 'ALL' || s.project_status === projectFilter;
    const matchSite    = siteFilter    === 'ALL' || s.site_status    === siteFilter;
    return matchSearch && matchProject && matchSite;
  });

  const anyLoading = loadingSites || loadingKpis;

  return (
    <div className="gv-page-dashboard flex flex-col gap-6 p-6">

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Projects & Sites</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            Manage and monitor all your field sites
          </p>
        </div>
        <button className="gv-btn-outline flex items-center gap-1.5 text-sm px-3 py-1.5"
          onClick={loadAll} disabled={anyLoading}>
          {anyLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* analytics error */}
      {kpisError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#fde68a' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          Analytics unavailable. Check your backend connection.
        </div>
      )}

      {/* analytics */}
      <div>
        <p className="gv-eyebrow mb-3">Site Analytics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <StatCard label="Total Sites"   value={kpis?.totalSites ?? 0}    icon={Building2}     loading={loadingKpis} />
          <StatCard label="Active Sites"  value={kpis?.activeSites ?? 0}   icon={Building2}     loading={loadingKpis} sub="Currently running" />
          <StatCard label="Planning"      value={kpis?.planningSites ?? 0} icon={ClipboardList} loading={loadingKpis} />
          <StatCard label="Total Workers" value={kpis?.totalWorkers ?? 0}  icon={Users}         loading={loadingKpis} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <StatCard label="Total Tasks"      value={kpis?.totalTasks ?? 0}          icon={ClipboardList} loading={loadingKpis} />
          <StatCard label="Completed Tasks"  value={kpis?.completedTasks ?? 0}      icon={ClipboardList} loading={loadingKpis} />
          <StatCard label="Total Invoiced"   value={kpis?.totalInvoiced ?? 0}       icon={FileText}      loading={loadingKpis} />
          <StatCard label="Pending Invoices" value={kpis?.pendingInvoiceValue ?? 0} icon={FileText}      loading={loadingKpis} sub="Value pending" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Permits"     value={kpis?.totalPermits ?? 0}                    icon={Shield}         loading={loadingKpis} />
          <StatCard label="Avg Review"        value={kpis?.avgReviewRating?.toFixed(1) ?? '0.0'} icon={Star}           loading={loadingKpis} sub={`${kpis?.totalReviews ?? 0} reviews`} />
          <StatCard label="Pending Transfers" value={kpis?.pendingTransactionsransfers ?? 0}     icon={ArrowLeftRight} loading={loadingKpis} />
          <StatCard label="Present Today"     value={kpis?.presentToday ?? 0}                    icon={UserCheck}      loading={loadingKpis} sub="Attendance" />
        </div>
      </div>

      {/* sites header */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-white whitespace-nowrap">All Sites</p>
        <div className="flex-1" style={{ height: '1px', background: 'var(--gv-glass-border)' }} />
        {!loadingSites && (
          <span className="text-xs whitespace-nowrap" style={{ color: 'var(--gv-text-subtle)' }}>
            {sites.length} site{sites.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* filters */}
      <div className="flex flex-col gap-3 -mt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--gv-text-faint)' }} />
          <input type="text" placeholder="Search by name, location or entity..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="gv-input pl-9" />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map((v) => {
            const f = ['ALL', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
            const idx = ['ALL', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].indexOf(v);
            const active = projectFilter === v;
            return (
              <button key={v}
                onClick={() => setProjectFilter(v as ProjectStatus | 'ALL')}
                className="gv-btn-pill text-xs"
                style={active ? { background: 'var(--gv-brand)', borderColor: 'var(--gv-brand)', color: '#fff' } : {}}>
                {f[idx]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE', 'CLOSED'] as const).map((s) => {
            const active = siteFilter === s;
            const labels: Record<string, string> = { ALL: 'All sites', ACTIVE: 'Active', INACTIVE: 'Inactive', CLOSED: 'Closed' };
            return (
              <button key={s} onClick={() => setSiteFilter(s)} className="gv-btn-pill text-xs"
                style={active ? { background: 'var(--gv-brand)', borderColor: 'var(--gv-brand)', color: '#fff' } : {}}>
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* sites error */}
      {sitesError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {sitesError}
          <button onClick={loadAll} className="ml-auto underline underline-offset-2 text-xs">Retry</button>
        </div>
      )}

      {/* grid */}
      {loadingSites ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse"
              style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="gv-icon-box w-14 h-14 mb-4" style={{ opacity: 0.4 }}>
            <Building2 className="w-7 h-7" style={{ color: 'var(--gv-brand)' }} />
          </div>
          <p className="text-sm font-medium text-white">
            {sites.length === 0 ? 'No sites yet' : 'No results found'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>
            {sites.length === 0 ? 'Create your first project to get started' : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((site) => (
            <SiteCard key={site.id} site={site} onClick={() => setSelectedSite(site)} />
          ))}
        </div>
      )}

      {selectedSite && (
        <SiteDetailPanel site={selectedSite} onClose={() => setSelectedSite(null)} />
      )}
    </div>
  );
}