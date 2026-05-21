'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { fetchSites, fetchOverviewKPIs } from '@/lib/api/sites';
import { Site, ProjectStatus, SiteStatus, OverviewKPIs } from '@/types/site';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  MapPin, Search, Calendar, Tag, Building2,
  RefreshCw, AlertCircle, Layers, ChevronRight,
  Loader2, Users, ClipboardList, FileText,
  Shield, Star, ArrowLeftRight, UserCheck,
  X, Hash, Clock, Navigation, User,
} from 'lucide-react';

const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PLANNING:    { label: 'Planning',    variant: 'secondary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  ON_HOLD:     { label: 'On Hold',     variant: 'outline' },
  COMPLETED:   { label: 'Completed',   variant: 'secondary' },
  CANCELLED:   { label: 'Cancelled',   variant: 'destructive' },
};

const SITE_STATUS_DOT: Record<SiteStatus, { label: string; color: string }> = {
  ACTIVE:   { label: 'Active',   color: 'bg-green-500' },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-400' },
  CLOSED:   { label: 'Closed',   color: 'bg-red-500' },
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
    <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {loading
          ? <div className="h-6 w-10 rounded bg-muted animate-pulse" />
          : <p className="text-2xl font-semibold">{value}</p>
        }
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SiteCard({ site, onClick }: { site: Site; onClick: () => void }) {
  const projMeta = PROJECT_STATUS_META[site.project_status] ?? PROJECT_STATUS_META['PLANNING'];
  const siteDot  = SITE_STATUS_DOT[site.site_status]        ?? SITE_STATUS_DOT['INACTIVE'];

  return (
    <Card
      onClick={onClick}
      className="flex flex-col hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer group"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {site.name}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-1.5 h-1.5 rounded-full ${siteDot.color}`} />
                {siteDot.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant={projMeta.variant}>{projMeta.label}</Badge>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1 space-y-2">
        {site.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{site.location}</span>
          </div>
        )}
        {site.inquiring_entity && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{site.inquiring_entity}</span>
          </div>
        )}
        {site.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{site.description}</p>
        )}
        {site.tags && site.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {site.tags.slice(0, 3).map((tag) => (
              <span key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
            {site.tags.length > 3 && (
              <span className="text-[11px] text-muted-foreground px-1">+{site.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {site.created_at ? format(new Date(site.created_at), 'dd MMM yyyy') : '—'}
        </div>
        {site.completion_date && (
          <span className="text-[11px] text-muted-foreground">
            Due {site.completion_date ? format(new Date(site.completion_date), 'dd MMM yyyy') : '—'}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function SiteDetailPanel({ site, onClose }: { site: Site; onClose: () => void }) {
  const projMeta = PROJECT_STATUS_META[site.project_status] ?? PROJECT_STATUS_META['PLANNING'];
  const siteDot  = SITE_STATUS_DOT[site.site_status]        ?? SITE_STATUS_DOT['INACTIVE'];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l shadow-xl z-50 flex flex-col overflow-hidden">

        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm leading-tight truncate">{site.name}</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${siteDot.color}`} />
                {siteDot.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={projMeta.variant}>{projMeta.label}</Badge>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {site.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{site.description}</p>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Basic Information
            </p>
            <div className="rounded-xl border bg-card px-4">
              {site.location && <DetailRow icon={MapPin} label="Location" value={site.location} />}
              <DetailRow icon={Calendar} label="Created"
                value={site.created_at ? format(new Date(site.created_at), 'dd MMM yyyy, HH:mm') : '—'} />
              {site.updated_at && (
                <DetailRow icon={Clock} label="Last updated"
                  value={site.updated_at ? format(new Date(site.updated_at), 'dd MMM yyyy, HH:mm') : '—'} />
              )}
              {site.completion_date && (
                <DetailRow icon={Calendar} label="Completion date"
                  value={site.completion_date ? format(new Date(site.completion_date), 'dd MMM yyyy') : '—'} />
              )}
              <DetailRow icon={Hash} label="Site ID" value={`#${site.id}`} />
            </div>
          </div>

          {(site.tender_name || site.inquiring_entity) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Entity Details
              </p>
              <div className="rounded-xl border bg-card px-4">
                {site.tender_name && (
                  <DetailRow icon={FileText} label="Tender name" value={site.tender_name} />
                )}
                {site.inquiring_entity && (
                  <DetailRow icon={Layers} label="Inquiring entity" value={site.inquiring_entity} />
                )}
              </div>
            </div>
          )}

          {(site.latitude !== null || site.longitude !== null) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Geo Coordinates
              </p>
              <div className="rounded-xl border bg-card px-4">
                {site.latitude !== null && (
                  <DetailRow icon={Navigation} label="Latitude" value={site.latitude} />
                )}
                {site.longitude !== null && (
                  <DetailRow icon={Navigation} label="Longitude" value={site.longitude} />
                )}
              </div>
            </div>
          )}

          {site.tags && site.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {site.tags.map((tag) => (
                  <span key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium">
                    <Tag className="w-3 h-3 text-muted-foreground" />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              System
            </p>
            <div className="rounded-xl border bg-card px-4">
              <DetailRow icon={User} label="Created by" value={`User #${site.created_by}`} />
              {site.updated_by && (
                <DetailRow icon={User} label="Last updated by" value={`User #${site.updated_by}`} />
              )}
              {site.field_operator_id && (
                <DetailRow icon={User} label="Field operator" value={`User #${site.field_operator_id}`} />
              )}
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
    <div className="flex flex-col gap-6 p-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects & Sites</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all your field sites</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} disabled={anyLoading}>
          {anyLoading
            ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
          Refresh
        </Button>
      </div>

      {kpisError && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Analytics unavailable. Check your backend connection.
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Site Analytics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <StatCard label="Total Sites"    value={kpis?.totalSites ?? 0}    icon={Building2}     loading={loadingKpis} />
          <StatCard label="Active Sites"   value={kpis?.activeSites ?? 0}   icon={Building2}     loading={loadingKpis} sub="Currently running" />
          <StatCard label="Planning"       value={kpis?.planningSites ?? 0} icon={ClipboardList} loading={loadingKpis} />
          <StatCard label="Total Workers"  value={kpis?.totalWorkers ?? 0}  icon={Users}         loading={loadingKpis} />
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

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium whitespace-nowrap">All Sites</p>
        <div className="flex-1 border-t" />
        {!loadingSites && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {sites.length} site{sites.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 -mt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search by name, location or entity..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div className="flex flex-wrap gap-2">
          {PROJECT_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setProjectFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                projectFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE', 'CLOSED'] as const).map((s) => (
            <button key={s} onClick={() => setSiteFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                siteFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}>
              {s === 'ALL' ? 'All sites' : SITE_STATUS_DOT[s].label}
            </button>
          ))}
        </div>
      </div>

      {sitesError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {sitesError}
          <button onClick={loadAll} className="ml-auto underline underline-offset-2 text-xs">Retry</button>
        </div>
      )}

      {loadingSites ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {sites.length === 0 ? 'No sites yet' : 'No results found'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
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