'use client';

import { CalendarRange, FileText, MapPin, Tag, Wallet, ClipboardList } from 'lucide-react';
import type { SiteDetail } from '@/lib/api/quality';
import { formatDisplayDate } from '@/lib/utils/format-display-date';

interface SiteInfoCardProps {
  site: SiteDetail;
  onUpdateBQ?: () => void;
}

export default function SiteInfoCard({ site, onUpdateBQ }: SiteInfoCardProps) {
  return (
    <div className="gv-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="gv-tag bg-white/5 text-(--gv-text-muted) border border-(--gv-glass-border)">
          {site.projectStatus}
        </span>
        <span className="gv-tag bg-white/5 text-(--gv-text-muted) border border-(--gv-glass-border)">
          {site.siteStatus}
        </span>
      </div>

      {site.description && (
        <p className="text-sm text-(--gv-text-muted) leading-relaxed">{site.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        {/* Left column — site details */}
        <div className="space-y-4">
          {site.tendererName && (
            <div>
              <p className="gv-label mb-1">Company</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary)">
                <FileText size={14} className="text-(--gv-text-subtle) shrink-0" />
                {site.tendererName}
              </p>
            </div>
          )}
          {site.location && (
            <div>
              <p className="gv-label mb-1">Location</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary)">
                <MapPin size={14} className="text-(--gv-text-subtle) shrink-0" />
                {site.location}
              </p>
            </div>
          )}
          {site.completionDate && (
            <div>
              <p className="gv-label mb-1">Completion Date</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary)">
                <CalendarRange size={14} className="text-(--gv-text-subtle) shrink-0" />
                {formatDisplayDate(site.completionDate)}
              </p>
            </div>
          )}
          {site.tags && site.tags.length > 0 && (
            <div>
              <p className="gv-label mb-1">Tags</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary) flex-wrap">
                <Tag size={14} className="text-(--gv-text-subtle) shrink-0" />
                {site.tags.join(', ')}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between h-full">
          <div>
            <p className="gv-label mb-2">Bill of Quantities</p>
            <button
              onClick={onUpdateBQ}
              className="gv-btn-outline gap-2 text-sm w-1/2"
              title="Coming soon — pending backend support"
            >
              <ClipboardList size={14} /> Add/Update BQ
            </button>
          </div>
          <div>
            <p className="gv-label mb-2">Estimated Value</p>
            <button
              disabled
              className="gv-btn-outline gap-2 text-sm w-1/2 opacity-70 cursor-not-allowed"
              title="Read-only — editing isn't supported by the backend yet"
            >
              <Wallet size={14} />
              {site.estimatedValue?.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}