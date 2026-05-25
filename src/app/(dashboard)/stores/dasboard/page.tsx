'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
  Package, AlertTriangle, TrendingDown, BarChart3, Activity, CheckCircle2, XCircle, ChevronDown,
  Coins, X, ChevronRight, Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Site { id: number; name: string; }

interface StoreSummary {
  total_materials: number;
  low_stock_count: number;
  tools_available: number;
  tools_in_use:    number;
  tools_damaged:   number;
  total_hire_cost: number;
}

interface UnitBrief {
  id:     number;
  name:   string;
  symbol: string;
}

interface MaterialItem {
  id:            number;
  name:          string;
  unit:          UnitBrief;
  quantity:      number;
  minimum_stock: number;
}

interface ToolItem {
  id:         number;
  name:       string;
  status:     string;
  hire_cost?: number;
}

type DetailType = 'materials' | 'tools' | null;
type ToolTab    = 'all' | 'available' | 'in_use' | 'damaged';

const TOOL_TABS: { key: ToolTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'available', label: 'Available' },
  { key: 'in_use',    label: 'In Use'    },
  { key: 'damaged',   label: 'Damaged'   },
];

const TAB_STATUS: Record<ToolTab, string | undefined> = {
  all:       undefined,
  available: 'AVAILABLE',
  in_use:    'IN_USE',
  damaged:   'DAMAGED',
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:     string;
  value:     string | number;
  sub?:      string;
  icon:      React.ReactNode;
  variant?:  'default' | 'warn' | 'danger' | 'success' | 'info';
  onClick?:  () => void;
}

function StatCard({ label, value, sub, icon, variant = 'default', onClick }: StatCardProps) {
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
    <div
      className={`gv-card flex flex-col gap-4 ${border[variant]} ${onClick ? 'cursor-pointer hover:border-white/20 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="gv-icon-box"><span className={iconCls[variant]}>{icon}</span></div>
        <div className="flex items-center gap-2">
          {variant !== 'default' && (
            <span className={`gv-tag ${
              variant === 'warn'    ? 'border-yellow-500/30 text-yellow-400' :
              variant === 'danger'  ? 'border-destructive/30 text-destructive' :
              variant === 'success' ? 'border-green-500/30 text-green-400' :
                                      'border-blue-500/30 text-blue-400'
            }`}>{tagMap[variant]}</span>
          )}
          {onClick && <ChevronRight size={14} className="text-white/30" />}
        </div>
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className={`text-3xl font-bold tracking-tight ${valCls[variant]}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── SiteSelector ─────────────────────────────────────────────────────────────

function SiteSelector({
  sites, selectedSiteId, onChange, isLoading,
}: {
  sites:          Site[];
  selectedSiteId: number | null;
  onChange:       (id: number) => void;
  isLoading:      boolean;
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

// ─── MaterialsDetail ──────────────────────────────────────────────────────────

function MaterialsDetail({ siteId }: { siteId: number }) {
  const [items, setItems]       = useState<MaterialItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]       = useState(false);
  const [skip, setSkip]         = useState(0);
  const [hasMore, setHasMore]   = useState(true);
  const LIMIT = 20;

  const fetchPage = useCallback(async (pageSkip: number, append: boolean) => {
    try {
      const res  = await api.get(`/store/materials/${siteId}/all`, { params: { skip: pageSkip, limit: LIMIT } });
      const raw  = res.data?.data ?? res.data;
      const list: MaterialItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      setItems((prev) => append ? [...prev, ...list] : list);
      setHasMore(list.length === LIMIT);
    } catch {
      setError(true);
    }
  }, [siteId]);

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setSkip(0);
    setHasMore(true);
    setError(false);
    fetchPage(0, false).finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = async () => {
    const next = skip + LIMIT;
    setLoadingMore(true);
    await fetchPage(next, true);
    setSkip(next);
    setLoadingMore(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={22} className="animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertTriangle size={28} className="text-destructive opacity-40 mb-2" />
      <p className="text-xs text-muted-foreground">Failed to load materials.</p>
    </div>
  );

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Package size={28} className="opacity-20 mb-2" />
      <p className="text-xs text-muted-foreground">No materials registered.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-0">
      {/* Column headers */}
      <div className="grid gap-x-2 px-3 py-1.5 mb-1 border-b border-white/8"
           style={{ gridTemplateColumns: '1fr 52px 64px' }}>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Material</p>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Unit</p>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">Qty</p>
      </div>

      {items.map((m) => {
        const isLow = m.quantity <= m.minimum_stock;
        return (
          <div key={m.id} className="grid gap-x-2 items-center px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
               style={{ gridTemplateColumns: '1fr 52px 64px' }}>
            <p className="text-sm font-medium truncate">{m.name}</p>
            <p className="text-xs text-muted-foreground text-center">{m.unit.symbol}</p>
            <div className="text-right">
              <p className={`text-sm font-semibold tabular-nums ${isLow ? 'text-yellow-400' : 'text-foreground'}`}>
                {m.quantity.toLocaleString()}
              </p>
              {isLow && <p className="text-[10px] text-yellow-400/70 leading-none mt-0.5">Low</p>}
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-2 w-full h-9 rounded-lg border border-white/10 text-xs text-muted-foreground
                     hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingMore ? <Loader2 size={13} className="animate-spin" /> : 'Load more'}
        </button>
      )}
    </div>
  );
}

// ─── ToolsDetail ──────────────────────────────────────────────────────────────

function ToolsDetail({ siteId, initialTab = 'all' }: { siteId: number; initialTab?: ToolTab }) {
  const [activeTab, setActiveTab] = useState<ToolTab>(initialTab);
  const [cache, setCache]         = useState<Partial<Record<ToolTab, ToolItem[]>>>({});
  const [loading, setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState(false);
  const [skips, setSkips]         = useState<Partial<Record<ToolTab, number>>>({});
  const [hasMore, setHasMore]     = useState<Partial<Record<ToolTab, boolean>>>({});
  const LIMIT = 20;

  const fetchTab = useCallback(async (tab: ToolTab, pageSkip: number, append: boolean) => {
    const status = TAB_STATUS[tab];
    const res    = await api.get(`/store/tools/${siteId}/all`, {
      params: { skip: pageSkip, limit: LIMIT, ...(status ? { status } : {}) },
    });
    const raw   = res.data?.data ?? res.data;
    const list: ToolItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
    setCache((prev) => ({ ...prev, [tab]: append ? [...(prev[tab] ?? []), ...list] : list }));
    setHasMore((prev) => ({ ...prev, [tab]: list.length === LIMIT }));
  }, [siteId]);

  useEffect(() => {
    if (cache[activeTab] !== undefined) return; // already fetched
    setLoading(true);
    setError(false);
    fetchTab(activeTab, 0, false)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeTab, cache, fetchTab]);

  const loadMore = async () => {
    const next = (skips[activeTab] ?? 0) + LIMIT;
    setLoadingMore(true);
    await fetchTab(activeTab, next, true).catch(() => {});
    setSkips((prev) => ({ ...prev, [activeTab]: next }));
    setLoadingMore(false);
  };

  const statusColor: Record<string, string> = {
    AVAILABLE: 'text-green-400',
    IN_USE:    'text-blue-400',
    DAMAGED:   'text-destructive',
  };
  const statusLabel: Record<string, string> = {
    AVAILABLE: 'Available',
    IN_USE:    'In Use',
    DAMAGED:   'Damaged',
  };

  const items = cache[activeTab] ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5">
        {TOOL_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 h-7 rounded-md text-xs font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-primary" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle size={26} className="text-destructive opacity-40 mb-2" />
          <p className="text-xs text-muted-foreground">Failed to load tools.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={26} className="opacity-20 mb-2" />
          <p className="text-xs text-muted-foreground">No tools in this category.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-1">
          {items.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-white/8 flex items-center justify-center flex-shrink-0">
                  <Activity size={13} className="text-primary" />
                </div>
                <p className="text-sm font-medium">{t.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {t.hire_cost !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    KES {t.hire_cost.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </p>
                )}
                <span className={`text-xs font-medium ${statusColor[t.status] ?? 'text-muted-foreground'}`}>
                  {statusLabel[t.status] ?? t.status}
                </span>
              </div>
            </div>
          ))}

          {hasMore[activeTab] && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-2 w-full h-9 rounded-lg border border-white/10 text-xs text-muted-foreground
                         hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={13} className="animate-spin" /> : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DetailOverlay ────────────────────────────────────────────────────────────

function DetailOverlay({
  type, siteId, siteName, initialTab = 'all', onClose,
}: {
  type:         DetailType;
  siteId:       number;
  siteName:     string;
  initialTab?:  ToolTab;
  onClose:      () => void;
}) {
  if (!type) return null;

  const title = type === 'materials' ? 'Materials' : 'Tools';
  const Icon  = type === 'materials' ? Package : Activity;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Card — stops click propagation so it doesn't close when clicking inside */}
      <div
        className="gv-card w-full max-w-md max-h-[80vh] flex flex-col gap-0 overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="gv-icon-box !w-7 !h-7">
              <Icon size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[11px] text-muted-foreground">{siteName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/8 transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {type === 'materials'
            ? <MaterialsDetail siteId={siteId} />
            : <ToolsDetail siteId={siteId} initialTab={initialTab} />
          }
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoreDashboardPage() {
  const [sites, setSites]                       = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId]     = useState<number | null>(null);
  const [summary, setSummary]                   = useState<StoreSummary | null>(null);
  const [isSitesLoading, setIsSitesLoading]     = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError]                       = useState(false);
  const [detailType, setDetailType]             = useState<DetailType>(null);
  const [detailTab,  setDetailTab]              = useState<ToolTab>('all');

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
    // Per-site overview endpoint
    api.get(`/store/site/${selectedSiteId}`)
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
      sub: 'Registered in store',     icon: <Package size={18} />,      variant: 'default',
      onClick: () => { setDetailTab('all'); setDetailType('materials'); },
    },
    { label: 'Low Stock Items', value: summary.low_stock_count,
      sub: 'Below minimum level',     icon: <TrendingDown size={18} />, variant: summary.low_stock_count  > 0 ? 'warn'   : 'success' },
    { label: 'Tools Available', value: summary.tools_available,
      sub: 'Ready for deployment',    icon: <CheckCircle2 size={18} />, variant: 'success',
      onClick: () => { setDetailTab('available'); setDetailType('tools'); },
    },
    { label: 'Tools Damaged',   value: summary.tools_damaged,
      sub: 'Requiring maintenance',   icon: <XCircle size={18} />,      variant: summary.tools_damaged    > 0 ? 'danger' : 'default' },
    { label: 'Tools In Use',    value: summary.tools_in_use,
      sub: 'Currently deployed',      icon: <Activity size={18} />,     variant: 'info'     },
    { label: 'Total Hire Cost',
      value: `KES ${(summary.total_hire_cost ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Active + available tools', icon: <Coins size={18} />,  variant: 'default'  },
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
          onChange={(id) => { setDetailType(null); setSelectedSiteId(id); }}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Detail overlay */}
      {detailType && selectedSiteId && selectedSite && (
        <DetailOverlay
          type={detailType}
          siteId={selectedSiteId}
          siteName={selectedSite.name}
          initialTab={detailTab}
          onClose={() => setDetailType(null)}
        />
      )}
    </div>
  );
}