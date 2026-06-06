'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, AlertTriangle, TrendingDown, BarChart3,
  XCircle, ChevronDown, Coins, ChevronRight, RefreshCw, Wrench,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { Site, StoreSummary } from '@/types/store';



const BORDER_CLS: Record<string, string> = {
  default: 'border-[color:var(--border)]',
  warn:    'border-[color:var(--gv-border-warn)]',
  danger:  'border-[color:var(--gv-border-danger)]',
  success: 'border-[color:var(--gv-border-success)]',
  info:    'border-[color:var(--gv-border-info)]',
};

const ICON_CLS: Record<string, string> = {
  default: 'text-[color:var(--primary)]',
  warn:    'text-[color:var(--gv-text-warn)]',
  danger:  'text-[color:var(--destructive)]',
  success: 'text-[color:var(--gv-text-success)]',
  info:    'text-[color:var(--gv-text-info)]',
};

const VAL_CLS: Record<string, string> = {
  default: 'text-[color:var(--foreground)]',
  warn:    'text-[color:var(--gv-text-warn)]',
  danger:  'text-[color:var(--destructive)]',
  success: 'text-[color:var(--gv-text-success)]',
  info:    'text-[color:var(--gv-text-info)]',
};

const TAG_CLS: Record<string, string> = {
  warn:    'border-[color:var(--gv-border-warn)] text-[color:var(--gv-text-warn)]',
  danger:  'border-[color:var(--gv-border-danger)] text-[color:var(--destructive)]',
  success: 'border-[color:var(--gv-border-success)] text-[color:var(--gv-text-success)]',
  info:    'border-[color:var(--gv-border-info)] text-[color:var(--gv-text-info)]',
};

const TAG_LABEL: Record<string, string> = {
  warn: 'Warning', danger: 'Critical', success: 'Good', info: 'Info',
};



function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}



function CardSkeleton() {
  return (
    <div className="gv-card h-36 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}



interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  icon:     React.ReactNode;
  variant?: 'default' | 'warn' | 'danger' | 'success' | 'info';
  onClick?: () => void;
}

function StatCard({ label, value, sub, icon, variant = 'default', onClick }: StatCardProps) {
  return (
    <div
      className={`gv-card flex flex-col gap-4 ${BORDER_CLS[variant]} ${
        onClick ? 'cursor-pointer hover:border-[color:var(--gv-glass-border-hover)] transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="gv-icon-box">
          <span className={ICON_CLS[variant]}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          {variant !== 'default' && (
            <span className={`gv-tag ${TAG_CLS[variant]}`}>{TAG_LABEL[variant]}</span>
          )}
          {onClick && <ChevronRight size={14} className="text-(--gv-text-faint)" />}
        </div>
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className={`text-3xl font-bold tracking-tight ${VAL_CLS[variant]}`}>{value}</p>
        {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}



function SiteSelector({
  sites, selectedSiteId, onChange, isLoading,
}: {
  sites: Site[];
  selectedSiteId: number | null;
  onChange: (id: number) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-64">
      <p className="gv-label">Viewing site</p>
      {isLoading ? (
        <div className="h-10 rounded-lg bg-[color:var(--gv-glass-bg)] relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                          bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ) : (
        <div className="relative">
          <select
            className="w-full appearance-none pr-9 pl-3 h-10 rounded-lg border border-[color:var(--border)]
                       bg-[color:var(--gv-glass-bg)] text-[color:var(--foreground)] text-sm cursor-pointer
                       outline-none transition-colors focus:border-[color:var(--gv-glass-border-hover)]
                       hover:border-[color:var(--gv-glass-border)] [&>option]:bg-[#0d1528] [&>option]:text-white"
            value={selectedSiteId ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {sites.length === 0 && <option value="">No sites available</option>}
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-[color:var(--gv-text-subtle)] pointer-events-none" />
        </div>
      )}
    </div>
  );
}




export default function StoreDashboardPage() {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  const { data: sitesRaw, loading: isSitesLoading } =
    useApi<Site[] | { items: Site[] }>('/sites/list');

  const sites: Site[] = useMemo(
    () => sitesRaw ? (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw.items ?? [])) : [],
    [sitesRaw],
  );

  const resolvedSiteId = selectedSiteId ?? sites[0]?.id ?? null;

  const {
    data: summary,
    loading: isSummaryLoading,
    error,
    refetch,
  } = useApi<StoreSummary>(
    `/store/site/${resolvedSiteId}`,
    { enabled: resolvedSiteId !== null },
  );

  const selectedSite = useMemo(
    () => sites.find((s) => s.id === resolvedSiteId),
    [sites, resolvedSiteId],
  );

  const cards = useMemo(() => {
    if (!summary || !resolvedSiteId) return [];
    return [
      {
        label: 'Total Materials',
        value: summary.total_materials,
        sub:   'Tap to view material details',
        icon:  <Package size={18} />,
        variant: 'default' as const,
        onClick: () => router.push(`/stores/materials/${resolvedSiteId}`),
      },
      {
        label: 'Low Stock Items',
        value: summary.low_stock_count,
        sub:   'Below minimum level',
        icon:  <TrendingDown size={18} />,
        variant: (summary.low_stock_count > 0 ? 'warn' : 'default') as const,
      },
      {
        label: 'Total Tools',
        value: summary.total_tools,
        sub:   'Tap to view tools and their details',
        icon:  <Wrench size={18} />,
        variant: 'default' as const,
        onClick: () => router.push(`/stores/tools/${resolvedSiteId}`),
      },
      {
        label: 'Overdue Tools',
        value: summary.overdue_tools ?? 0,
        sub:   'Tools past their hire end date',
        icon:  <XCircle size={18} />,
        variant: 'default' as const,
      },
      {
        label: 'Total Hire Cost',
        value: fmtKES(summary.total_hire_cost ?? 0),
        icon:  <Coins size={18} />,
        variant: 'default' as const,
      },
    ];
  }, [summary, resolvedSiteId, router]);

  const showSkeletons = isSummaryLoading || (isSitesLoading && !summary);

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={resolvedSiteId}
          onChange={(id) => setSelectedSiteId(id)}
          isLoading={isSitesLoading}
        />
      </div>

      {selectedSite && (
        <div className="flex items-center gap-2">
          <BarChart3 size={13} className="text-[color:var(--primary)]" />
          <span className="text-xs text-[color:var(--muted-foreground)]">
            Store analytics for{' '}
            <span className="text-[color:var(--foreground)] font-medium">{selectedSite.name}</span>
          </span>
        </div>
      )}

      {!isSitesLoading && sites.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 size={40} className="text-[color:var(--muted-foreground)] opacity-30 mb-3" />
          <p className="text-sm font-medium mb-1">No sites yet</p>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            Add a site to start viewing store analytics
          </p>
        </div>
      )}

      {showSkeletons && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!isSitesLoading && error && !summary && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center
                        border-[color:var(--gv-border-danger)]">
          <AlertTriangle size={36} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)] mb-3">
            Failed to load store analytics.
          </p>
          <button
            onClick={refetch}
            className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                       cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {!showSkeletons && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

    </div>
  );
}