'use client';

import { Wallet } from 'lucide-react';

interface SiteEstimatedValueCardProps {
  value: number;
}

export default function SiteEstimatedValueCard({ value }: SiteEstimatedValueCardProps) {
  return (
    <div className="gv-card p-4 flex items-center gap-3">
      <Wallet size={18} className="text-[var(--gv-text-subtle)] flex-shrink-0" />
      <div>
        <p className="text-xs text-[var(--gv-text-subtle)] mb-1">Estimated Value</p>
        <p className="text-sm font-semibold text-[var(--gv-text-primary)]">
          {value?.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}
        </p>
      </div>
    </div>
  );
}