'use client';

import { Building2 } from 'lucide-react';
import type { Site } from '@/lib/sites-cache';

interface SiteCardProps {
  site: Site;
  accent: string;
  onSelect: (site: Site) => void;
}

export default function SiteCard({ site, accent, onSelect }: SiteCardProps) {
  return (
    <button
      onClick={() => onSelect(site)}
      className="gv-card gv-card-hover flex flex-col gap-3 p-4 text-left"
    >
      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${accent} flex items-center justify-center text-white shadow-lg`}>
        <Building2 size={18} />
      </div>
      <p className="font-semibold text-sm text-(--gv-text-primary) truncate">
        {site.name}
      </p>
    </button>
  );
}