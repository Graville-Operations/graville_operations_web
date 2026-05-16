"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fetchSites } from "@/lib/sites-api";
import { Site, ProjectStatus, SiteStatus } from "@/types/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  MapPin,
  Plus,
  Search,
  Calendar,
  Tag,
  Building2,
  RefreshCw,
  AlertCircle,
  Layers,
} from "lucide-react";

const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PLANNING:    { label: "Planning",     variant: "secondary" },
  IN_PROGRESS: { label: "In Progress",  variant: "default" },
  ON_HOLD:     { label: "On Hold",      variant: "outline" },
  COMPLETED:   { label: "Completed",    variant: "secondary" },
  CANCELLED:   { label: "Cancelled",    variant: "destructive" },
};

const SITE_STATUS_DOT: Record<SiteStatus, { label: string; color: string }> = {
  ACTIVE:   { label: "Active",   color: "bg-green-500" },
  INACTIVE: { label: "Inactive", color: "bg-gray-400" },
  CLOSED:   { label: "Closed",   color: "bg-red-500" },
};

const PROJECT_FILTERS: { label: string; value: ProjectStatus | "ALL" }[] = [
  { label: "All",         value: "ALL" },
  { label: "Planning",    value: "PLANNING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "On Hold",     value: "ON_HOLD" },
  { label: "Completed",   value: "COMPLETED" },
  { label: "Cancelled",   value: "CANCELLED" },
];

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SiteCard({ site }: { site: Site }) {
  const projMeta = PROJECT_STATUS_META[site.project_status];
  const siteDot  = SITE_STATUS_DOT[site.site_status];

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm leading-tight truncate">{site.name}</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-1.5 h-1.5 rounded-full ${siteDot.color}`} />
                {siteDot.label}
              </span>
            </div>
          </div>
          <Badge variant={projMeta.variant}>{projMeta.label}</Badge>
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
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {site.tags.length > 3 && (
              <span className="text-[11px] text-muted-foreground px-1">
                +{site.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {format(new Date(site.created_at), "dd MMM yyyy")}
        </div>
        {site.completion_date && (
          <span className="text-[11px] text-muted-foreground">
            Due {format(new Date(site.completion_date), "dd MMM yyyy")}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ProjectsDashboardPage() {
  const [sites, setSites]               = useState<Site[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | "ALL">("ALL");
  const [siteFilter, setSiteFilter]     = useState<SiteStatus | "ALL">("ALL");

  const loadSites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSites();
      setSites(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSites(); }, []);

  // ── derived stats ──
  const total      = sites.length;
  const active     = sites.filter((s) => s.site_status    === "ACTIVE").length;
  const inProgress = sites.filter((s) => s.project_status === "IN_PROGRESS").length;
  const completed  = sites.filter((s) => s.project_status === "COMPLETED").length;

  // ── filtered list ──
  const filtered = sites.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(q) ||
      (s.location ?? "").toLowerCase().includes(q) ||
      (s.inquiring_entity ?? "").toLowerCase().includes(q);
    const matchProject = projectFilter === "ALL" || s.project_status === projectFilter;
    const matchSite    = siteFilter    === "ALL" || s.site_status    === siteFilter;
    return matchSearch && matchProject && matchSite;
  });

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects & Sites</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and monitor all your field sites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSites} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/dashboard/projects/new-project">
            <Button size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New project
            </Button>
          </Link>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total sites"   value={total} />
        <StatCard label="Active"        value={active}      sub="Currently running" />
        <StatCard label="In progress"   value={inProgress} />
        <StatCard label="Completed"     value={completed} />
      </div>

      {/* ── filters ── */}
      <div className="flex flex-col gap-3">
        {/* search — plain HTML input, no shadcn Input needed */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* project-status tab filter */}
        <div className="flex flex-wrap gap-2">
          {PROJECT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setProjectFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                projectFilter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* site-status filter */}
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "INACTIVE", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSiteFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                siteFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {s === "ALL" ? "All sites" : SITE_STATUS_DOT[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── error ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            onClick={loadSites}
            className="ml-auto underline underline-offset-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {sites.length === 0 ? "No sites yet" : "No results found"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {sites.length === 0
              ? "Create your first project to get started"
              : "Try adjusting your search or filters"}
          </p>
          {sites.length === 0 && (
            <Link href="/dashboard/projects/new-project" className="mt-4">
              <Button size="sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New project
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground -mt-3">
            Showing {filtered.length} of {total} site{total !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}