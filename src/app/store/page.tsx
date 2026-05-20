'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Package,
  AlertTriangle,
  Wrench,
  TrendingDown,
  DollarSign,
  ChevronDown,
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Site {
  id: number;
  name: string;
}

interface StoreSummary {
  totalMaterials: number;
  lowStockCount: number;
  toolsAvailable: number;
  toolsInUse: number;
  toolsDamaged: number;
  totalHireCost: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'warn' | 'danger' | 'success' | 'info';
}

function StatCard({ label, value, sub, icon, variant = 'default' }: StatCardProps) {
  const variantStyles: Record<string, string> = {
    default: 'border-white/12',
    warn:    'border-yellow-500/30',
    danger:  'border-destructive/30',
    success: 'border-green-500/30',
    info:    'border-blue-500/30',
  };
  const iconColor: Record<string, string> = {
    default: 'text-primary',
    warn:    'text-yellow-400',
    danger:  'text-destructive',
    success: 'text-green-400',
    info:    'text-blue-400',
  };
  const valueColor: Record<string, string> = {
    default: 'text-foreground',
    warn:    'text-yellow-400',
    danger:  'text-destructive',
    success: 'text-green-400',
    info:    'text-blue-400',
  };

  return (
    <div className={`gv-card flex flex-col gap-4 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="gv-icon-box">
          <span className={iconColor[variant]}>{icon}</span>
        </div>
        {variant !== 'default' && (
          <span
            className={`gv-tag ${
              variant === 'warn'
                ? 'border-yellow-500/30 text-yellow-400'
                : variant === 'danger'
                  ? 'border-destructive/30 text-destructive'
                  : variant === 'success'
                    ? 'border-green-500/30 text-green-400'
                    : 'border-blue-500/30 text-blue-400'
            }`}
          >
            {variant === 'warn' ? 'Warning' : variant === 'danger' ? 'Critical' : variant === 'success' ? 'Good' : 'Info'}
          </span>
        )}
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className={`text-3xl font-bold tracking-tight ${valueColor[variant]}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ToolsBreakdownCard({ available, inUse, damaged }: { available: number; inUse: number; damaged: number }) {
  const total = available + inUse + damaged;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const segments = [
    { label: 'Available', value: available, color: 'bg-green-400',   pct: pct(available), textColor: 'text-green-400'   },
    { label: 'In Use',    value: inUse,     color: 'bg-blue-400',    pct: pct(inUse),     textColor: 'text-blue-400'    },
    { label: 'Damaged',   value: damaged,   color: 'bg-destructive', pct: pct(damaged),   textColor: 'text-destructive' },
  ];

  return (
    <div className="gv-card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="gv-icon-box">
          <Wrench size={18} className="text-primary" />
        </div>
        <div>
          <p className="gv-label">Tools Fleet</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {segments.map((s) =>
          s.pct > 0 ? (
            <div
              key={s.label}
              className={`${s.color} transition-all duration-700`}
              style={{ width: `${s.pct}%` }}
            />
          ) : null,
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-lg font-bold ${s.textColor}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.pct}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoreDashboardPage() {
  const [sites, setSites]                       = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId]     = useState<number | null>(null);
  const [summary, setSummary]                   = useState<StoreSummary | null>(null);
  const [isSitesLoading, setIsSitesLoading]     = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Load sites list
  useEffect(() => {
    setIsSitesLoading(true);

    api
      .get('/sites/list')
      .then((res) => {
        // Defensive handling - ensure we always get an array
        const rawData = res.data?.data ?? res.data;
        const list: Site[] = Array.isArray(rawData) ? rawData : [];

        setSites(list);

        if (list.length > 0) {
          setSelectedSiteId(list[0].id);
        } else {
          setSelectedSiteId(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load sites:', err);
        setSites([]);
        setSelectedSiteId(null);
      })
      .finally(() => setIsSitesLoading(false));
  }, []);

  // Load analytics whenever site changes
  useEffect(() => {
    if (!selectedSiteId) return;

    const controller = new AbortController();

    setIsSummaryLoading(true);
    setSummary(null);

    api
      .get('/analytics/store', { params: { site_id: selectedSiteId } })
      .then((res) => {
        if (!controller.signal.aborted) {
          setSummary(res.data?.data ?? res.data ?? null);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSummaryLoading(false);
      });

    return () => controller.abort();
  }, [selectedSiteId]);

  // Safe selectedSite lookup
  const selectedSite = Array.isArray(sites) 
    ? sites.find((s) => s.id === selectedSiteId) 
    : undefined;

  const cards: StatCardProps[] = summary
    ? [
        {
          label:   'Total Materials',
          value:   summary.totalMaterials,
          sub:     'Registered in store',
          icon:    <Package size={18} />,
          variant: 'default',
        },
        {
          label:   'Low Stock',
          value:   summary.lowStockCount,
          sub:     'Below minimum level',
          icon:    <TrendingDown size={18} />,
          variant: summary.lowStockCount > 0 ? 'warn' : 'success',
        },
        {
          label:   'Tools Available',
          value:   summary.toolsAvailable,
          sub:     'Ready for deployment',
          icon:    <CheckCircle2 size={18} />,
          variant: 'success',
        },
        {
          label:   'Tools Damaged',
          value:   summary.toolsDamaged,
          sub:     'Requiring maintenance',
          icon:    <XCircle size={18} />,
          variant: summary.toolsDamaged > 0 ? 'danger' : 'default',
        },
        {
          label:   'Tools In Use',
          value:   summary.toolsInUse,
          sub:     'Currently deployed',
          icon:    <Activity size={18} />,
          variant: 'info',
        },
        {
          label:   'Total Hire Cost',
          value:   `$${summary.totalHireCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          sub:     'Active + available tools',
          icon:    <DollarSign size={18} />,
          variant: 'default',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>

        <div className="relative w-full sm:w-64">
          {isSitesLoading ? (
            <div className="gv-input h-10 animate-pulse bg-muted" />
          ) : (
            <>
              <select
                className="gv-input appearance-none pr-9 h-10 text-sm cursor-pointer"
                value={selectedSiteId ?? ''}
                onChange={(e) => setSelectedSiteId(e.target.value ? Number(e.target.value) : null)}
              >
                {sites.length === 0 && <option value="">No sites available</option>}
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </>
          )}
        </div>
      </div>

      {selectedSite && (
        <div className="flex items-center gap-2">
          <BarChart3 size={13} className="text-primary" />
          <span className="text-xs text-muted-foreground">
            Showing store analytics for{' '}
            <span className="text-foreground font-medium">{selectedSite.name}</span>
          </span>
        </div>
      )}

      {isSummaryLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gv-card h-36 animate-pulse" />
          ))}
        </div>
      )}

      {!isSummaryLoading && !summary && !isSitesLoading && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 size={40} className="text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm text-muted-foreground">Select a site to view its store analytics</p>
        </div>
      )}

      {!isSummaryLoading && summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolsBreakdownCard
              available={summary.toolsAvailable}
              inUse={summary.toolsInUse}
              damaged={summary.toolsDamaged}
            />

            <div className={`gv-card flex flex-col gap-4 ${summary.lowStockCount > 0 ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
              <div className="flex items-center gap-2">
                <div className="gv-icon-box">
                  {summary.lowStockCount > 0
                    ? <AlertTriangle size={18} className="text-yellow-400" />
                    : <CheckCircle2 size={18} className="text-green-400" />
                  }
                </div>
                <div>
                  <p className="gv-label">Stock Health</p>
                  <p className={`text-2xl font-bold ${summary.lowStockCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {summary.lowStockCount > 0 ? `${summary.lowStockCount} item${summary.lowStockCount > 1 ? 's' : ''} low` : 'All good'}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                {summary.lowStockCount > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {summary.lowStockCount} material{summary.lowStockCount > 1 ? 's are' : ' is'} below the minimum stock
                    threshold. Visit <span className="text-foreground font-medium">Stock Registers</span> to review.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    All {summary.totalMaterials} material{summary.totalMaterials !== 1 ? 's are' : ' is'} above minimum
                    stock levels. No action required.
                  </p>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${summary.lowStockCount > 0 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{
                    width: summary.totalMaterials > 0
                      ? `${Math.round(((summary.totalMaterials - summary.lowStockCount) / summary.totalMaterials) * 100)}%`
                      : '100%',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{summary.totalMaterials - summary.lowStockCount} healthy</span>
                <span>{summary.lowStockCount} low stock</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}