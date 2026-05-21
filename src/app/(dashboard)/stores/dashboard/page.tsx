'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Package, AlertTriangle, Wrench, TrendingDown,
  DollarSign, BarChart3, Activity, CheckCircle2, XCircle, ChevronDown,
} from 'lucide-react';

interface Site { id: number; name: string; }

interface StoreSummary {
  total_materials: number;
  low_stock_count: number;
  tools_available: number;
  tools_in_use:    number;
  tools_damaged:   number;
  total_hire_cost: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?:  string;
  icon:  React.ReactNode;
  variant?: 'default' | 'warn' | 'danger' | 'success' | 'info';
}

function StatCard({ label, value, sub, icon, variant = 'default' }: StatCardProps) {
  const border: Record<string, string> = {
    default: '', warn: 'border-yellow-500/30', danger: 'border-destructive/30',
    success: 'border-green-500/30', info: 'border-blue-500/30',
  };
  const iconCls: Record<string, string> = {
    default: 'text-primary', warn: 'text-yellow-400', danger: 'text-destructive',
    success: 'text-green-400', info: 'text-blue-400',
  };
  const valCls: Record<string, string> = {
    default: 'text-foreground', warn: 'text-yellow-400', danger: 'text-destructive',
    success: 'text-green-400', info: 'text-blue-400',
  };
  const tagMap: Record<string, string> = {
    warn: 'Warning', danger: 'Critical', success: 'Good', info: 'Info',
  };
  return (
    <div className={`gv-card flex flex-col gap-4 ${border[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="gv-icon-box"><span className={iconCls[variant]}>{icon}</span></div>
        {variant !== 'default' && (
          <span className={`gv-tag ${
            variant === 'warn'    ? 'border-yellow-500/30 text-yellow-400' :
            variant === 'danger'  ? 'border-destructive/30 text-destructive' :
            variant === 'success' ? 'border-green-500/30 text-green-400' :
                                    'border-blue-500/30 text-blue-400'
          }`}>{tagMap[variant]}</span>
        )}
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className={`text-3xl font-bold tracking-tight ${valCls[variant]}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ToolsBreakdownCard({ available, inUse, damaged }: { available: number; inUse: number; damaged: number }) {
  const total = available + inUse + damaged;
  const pct   = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const segs  = [
    { label: 'Available', value: available, color: 'bg-green-400',   text: 'text-green-400',   pct: pct(available) },
    { label: 'In Use',    value: inUse,     color: 'bg-blue-400',    text: 'text-blue-400',    pct: pct(inUse)     },
    { label: 'Damaged',   value: damaged,   color: 'bg-destructive', text: 'text-destructive', pct: pct(damaged)   },
  ];
  return (
    <div className="gv-card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="gv-icon-box"><Wrench size={18} className="text-primary" /></div>
        <div><p className="gv-label">Tools Fleet</p><p className="text-2xl font-bold">{total}</p></div>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {segs.map((s) => s.pct > 0 && (
          <div key={s.label} className={`${s.color} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {segs.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-lg font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.pct}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reusable dark-styled site selector
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
        <div className="h-10 rounded-lg animate-pulse bg-white/8" />
      ) : (
        <div className="relative">
          <select
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white' }}
            className="w-full appearance-none pr-9 pl-3 h-10 rounded-lg border border-white/12 text-sm
                       cursor-pointer outline-none transition-colors
                       focus:border-white/30 hover:border-white/25
                       [&>option]:bg-[#0d1528] [&>option]:text-white"
            value={selectedSiteId ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {sites.length === 0 && <option value="">No sites available</option>}
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      )}
    </div>
  );
}

export default function StoreDashboardPage() {
  const [sites, setSites]                       = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId]     = useState<number | null>(null);
  const [summary, setSummary]                   = useState<StoreSummary | null>(null);
  const [isSitesLoading, setIsSitesLoading]     = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError]                       = useState(false);

  useEffect(() => {
    api.get('/sites/list')
      .then((res) => {
        const raw  = res.data?.data;
        const list: Site[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setSites(list);
        if (list.length > 0) setSelectedSiteId(list[0].id);
      })
      .catch(console.error)
      .finally(() => setIsSitesLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSiteId === null) return;
    setIsSummaryLoading(true);
    setError(false);
    setSummary(null);
    api.get('/analytics/store', { params: { site_id: selectedSiteId } })
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        if (raw) setSummary(raw as StoreSummary);
      })
      .catch(() => setError(true))
      .finally(() => setIsSummaryLoading(false));
  }, [selectedSiteId]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  const cards: StatCardProps[] = summary ? [
    { label: 'Total Materials', value: summary.total_materials,
      sub: 'Registered in store',     icon: <Package size={18} />,      variant: 'default'  },
    { label: 'Low Stock Items', value: summary.low_stock_count,
      sub: 'Below minimum level',     icon: <TrendingDown size={18} />, variant: summary.low_stock_count  > 0 ? 'warn'   : 'success' },
    { label: 'Tools Available', value: summary.tools_available,
      sub: 'Ready for deployment',    icon: <CheckCircle2 size={18} />, variant: 'success'  },
    { label: 'Tools Damaged',   value: summary.tools_damaged,
      sub: 'Requiring maintenance',   icon: <XCircle size={18} />,      variant: summary.tools_damaged    > 0 ? 'danger' : 'default' },
    { label: 'Tools In Use',    value: summary.tools_in_use,
      sub: 'Currently deployed',      icon: <Activity size={18} />,     variant: 'info'     },
    { label: 'Total Hire Cost',
      value: `$${(summary.total_hire_cost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Active + available tools', icon: <DollarSign size={18} />,  variant: 'default'  },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={selectedSiteId}
          onChange={setSelectedSiteId}
          isLoading={isSitesLoading}
        />
      </div>

      {selectedSite && (
        <div className="flex items-center gap-2">
          <BarChart3 size={13} className="text-primary" />
          <span className="text-xs text-muted-foreground">
            Store analytics for <span className="text-foreground font-medium">{selectedSite.name}</span>
          </span>
        </div>
      )}

      {!isSitesLoading && sites.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 size={40} className="text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm font-medium mb-1">No sites yet</p>
          <p className="text-xs text-muted-foreground">Add a site to start viewing store analytics</p>
        </div>
      )}

      {isSummaryLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="gv-card h-36 animate-pulse" />)}
        </div>
      )}

      {!isSummaryLoading && error && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center border-destructive/30">
          <AlertTriangle size={36} className="text-destructive opacity-40 mb-3" />
          <p className="text-sm text-muted-foreground">Failed to load store analytics. Please try again.</p>
        </div>
      )}

      {!isSummaryLoading && summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((c) => <StatCard key={c.label} {...c} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolsBreakdownCard
              available={summary.tools_available}
              inUse={summary.tools_in_use}
              damaged={summary.tools_damaged}
            />
            <div className={`gv-card flex flex-col gap-4 ${summary.low_stock_count > 0 ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
              <div className="flex items-center gap-2">
                <div className="gv-icon-box">
                  {summary.low_stock_count > 0
                    ? <AlertTriangle size={18} className="text-yellow-400" />
                    : <CheckCircle2 size={18} className="text-green-400" />}
                </div>
                <div>
                  <p className="gv-label">Stock Health</p>
                  <p className={`text-2xl font-bold ${summary.low_stock_count > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {summary.low_stock_count > 0
                      ? `${summary.low_stock_count} item${summary.low_stock_count > 1 ? 's' : ''} low`
                      : 'All good'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex-1">
                {summary.low_stock_count > 0
                  ? `${summary.low_stock_count} material${summary.low_stock_count > 1 ? 's are' : ' is'} below the minimum stock threshold. Visit Stock Registers to review.`
                  : `All ${summary.total_materials} material${summary.total_materials !== 1 ? 's are' : ' is'} above minimum stock levels.`}
              </p>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${summary.low_stock_count > 0 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{
                    width: summary.total_materials > 0
                      ? `${Math.round(((summary.total_materials - summary.low_stock_count) / summary.total_materials) * 100)}%`
                      : '100%',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{summary.total_materials - summary.low_stock_count} healthy</span>
                <span>{summary.low_stock_count} low stock</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}