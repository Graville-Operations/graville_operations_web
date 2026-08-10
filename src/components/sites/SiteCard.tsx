'use client';

import { format, isValid, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Site } from '@/types/site';


import { PROJECT_STATUS_META, normProjectStatus } from '@/lib/utils/site-helpers';
import { ProgressBar } from '@/components/shared/ProgressBar';

function formatDeadline(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, 'dd MMM yyyy') : null;
}

export function SiteCard({ site, onClick }: { site: Site; onClick: () => void }) {
   const ps         = normProjectStatus(site.project_status ?? '');
  const statusMeta = PROJECT_STATUS_META[ps];

  const pct = 0;
  const deadline = formatDeadline(site.completion_date);

  return (
    <div onClick={onClick}
      className="gv-card gv-card-hover flex flex-col gap-3 cursor-pointer group active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-xl text-white leading-tight">{site.name}</p>
        <span className={`text-base font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusMeta.bg} ${statusMeta.color}`}>
          {statusMeta.label}
        </span>
      </div>
      {deadline && (
        <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Deadline: {deadline}</span>
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