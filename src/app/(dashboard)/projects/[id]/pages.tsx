'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fetchSites } from '@/lib/api/sites';
import { Site, ProjectStatus, SiteStatus } from '@/types/site';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, MapPin, Calendar, Tag, Building2,
  Layers, Clock, Hash, FileText, Navigation,
  AlertCircle, Loader2, User,
} from 'lucide-react';

// ─────────────────────────────────────────────
//  Status meta
// ─────────────────────────────────────────────

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

const SITE_STATUS_META: Record<SiteStatus, { label: string; color: string }> = {
  ACTIVE:   { label: 'Active',   color: 'bg-green-500' },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-400' },
  CLOSED:   { label: 'Closed',   color: 'bg-red-500' },
};

// ─────────────────────────────────────────────
//  Detail row
// ─────────────────────────────────────────────

function DetailRow({
  icon: Icon, label, value,
}: {
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

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────

export default function SiteDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [site, setSite]       = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSites()
      .then((sites) => {
        const found = sites.find((s) => String(s.id) === id);
        if (!found) setError('Site not found.');
        else setSite(found);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load site.')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error ?? 'Site not found.'}
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Go back
        </Button>
      </div>
    );
  }

  const projMeta = PROJECT_STATUS_META[site.project_status];
  const siteMeta = SITE_STATUS_META[site.site_status];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-6">

      {/* back */}
      <Link
        href="/projects/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* hero */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">{site.name}</h1>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span className={`w-2 h-2 rounded-full ${siteMeta.color}`} />
              {siteMeta.label}
            </span>
          </div>
        </div>
        <Badge variant={projMeta.variant} className="flex-shrink-0 mt-1">
          {projMeta.label}
        </Badge>
      </div>

      {/* description */}
      {site.description && (
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {site.description}
        </p>
      )}

      {/* basic info */}
      <Card className="mb-4">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-1">
          {site.location && (
            <DetailRow icon={MapPin} label="Location" value={site.location} />
          )}
          <DetailRow icon={Calendar} label="Created"
            value={format(new Date(site.created_at), 'dd MMM yyyy, HH:mm')} />
          {site.updated_at && (
            <DetailRow icon={Clock} label="Last updated"
              value={format(new Date(site.updated_at), 'dd MMM yyyy, HH:mm')} />
          )}
          {site.completion_date && (
            <DetailRow icon={Calendar} label="Completion date"
              value={format(new Date(site.completion_date), 'dd MMM yyyy')} />
          )}
          <DetailRow icon={Hash} label="Site ID" value={`#${site.id}`} />
        </CardContent>
      </Card>

      {/* entity details */}
      {(site.tender_name || site.inquiring_entity) && (
        <Card className="mb-4">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-1">
            {site.tender_name && (
              <DetailRow icon={FileText} label="Tender name" value={site.tender_name} />
            )}
            {site.inquiring_entity && (
              <DetailRow icon={Layers} label="Inquiring entity" value={site.inquiring_entity} />
            )}
          </CardContent>
        </Card>
      )}

      {/* coordinates */}
      {(site.latitude !== null || site.longitude !== null) && (
        <Card className="mb-4">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Geo Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-1">
            {site.latitude !== null && (
              <DetailRow icon={Navigation} label="Latitude" value={site.latitude} />
            )}
            {site.longitude !== null && (
              <DetailRow icon={Navigation} label="Longitude" value={site.longitude} />
            )}
          </CardContent>
        </Card>
      )}

      {/* tags */}
      {site.tags && site.tags.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4">
            <div className="flex flex-wrap gap-2">
              {site.tags.map((tag) => (
                <span key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium">
                  <Tag className="w-3 h-3 text-muted-foreground" />{tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* system */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-1">
          <DetailRow icon={User} label="Created by"       value={`User #${site.created_by}`} />
          {site.updated_by && (
            <DetailRow icon={User} label="Last updated by" value={`User #${site.updated_by}`} />
          )}
          {site.field_operator_id && (
            <DetailRow icon={User} label="Field operator"  value={`User #${site.field_operator_id}`} />
          )}
        </CardContent>
      </Card>

    </div>
  );
}