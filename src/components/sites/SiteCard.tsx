'use client';

import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { RawSite } from '@/types/site-detail';
import { SITE_STATUS_META, normSiteStatus } from '@/lib/utils/site-helpers';
import { ProgressBar } from '@/components/shared/ProgressBar';

export function SiteCard({ site, onClick }: { site: RawSite; onClick: () => void }) {
  const ss       = normSiteStatus(site.siteStatus);
  const siteMeta = SITE_STATUS_META[ss];

  const pct = 0;

  return (
    <div onClick={onClick}
      className="gv-card gv-card-hover flex flex-col gap-3 cursor-pointer group active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-xl text-white leading-tight">{site.name}</p>
        <span className={`text-base font-semibold px-3 py-1 rounded-full flex-shrink-0 ${siteMeta.bg} ${siteMeta.color}`}>
          {siteMeta.label}
        </span>
      </div>
      {site.deadlineDate && (
        <div className="flex items-center gap-2 text-lg" style={{ color: 'var(--gv-text-muted)' }}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Deadline: {site.deadlineDate}</span>
        </div>
      )}
      {!site.deadlineDate && site.completion_date && (
        <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Deadline: {format(new Date(site.completion_date), 'dd MMM yyyy')}</span>
        </div>
      )}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: 'var(--gv-text-subtle)' }}>Progress</p>
          <p className="text-sm font-bold" style={{ color: 'var(--gv-brand)' }}>{pct}%</p>
        </div>
        <ProgressBar pct={pct} height="h-2" />
      </div>
    </div>
  );
}