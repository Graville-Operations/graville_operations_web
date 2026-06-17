'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Package, Wrench, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, RefreshCw, Clock,
  TrendingDown, Coins, AlertOctagon,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { Site, StoreMaterial, StoreTool, StockTab, StoreSummary } from '@/types/store';

function extractList<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) return d.items as T[];
    if (Array.isArray(d.data))  return d.data  as T[];
  }
  if (Array.isArray(r.data))  return r.data  as T[];
  if (Array.isArray(r.items)) return r.items as T[];
  return [];
}

function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type Variant = 'default' | 'warn' | 'danger' | 'success' | 'info';

const BORDER_CLS: Record<Variant, string> = {
  default: 'border-[color:var(--border)]',
  warn:    'border-[color:var(--gv-border-warn)]',
  danger:  'border-[color:var(--gv-border-danger)]',
  success: 'border-[color:var(--gv-border-success)]',
  info:    'border-[color:var(--gv-border-info)]',
};
const ICON_CLS: Record<Variant, string> = {
  default: 'text-[color:var(--primary)]',
  warn:    'text-[color:var(--gv-text-warn)]',
  danger:  'text-[color:var(--destructive)]',
  success: 'text-[color:var(--gv-text-success)]',
  info:    'text-[color:var(--gv-text-info)]',
};
const VAL_CLS: Record<Variant, string> = {
  default: 'text-[color:var(--foreground)]',
  warn:    'text-[color:var(--gv-text-warn)]',
  danger:  'text-[color:var(--destructive)]',
  success: 'text-[color:var(--gv-text-success)]',
  info:    'text-[color:var(--gv-text-info)]',
};
const TAG_CLS: Record<Exclude<Variant, 'default'>, string> = {
  warn:    'border-[color:var(--gv-border-warn)] text-[color:var(--gv-text-warn)]',
  danger:  'border-[color:var(--gv-border-danger)] text-[color:var(--destructive)]',
  success: 'border-[color:var(--gv-border-success)] text-[color:var(--gv-text-success)]',
  info:    'border-[color:var(--gv-border-info)] text-[color:var(--gv-text-info)]',
};
const TAG_LABEL: Record<Exclude<Variant, 'default'>, string> = {
  warn: 'Warning', danger: 'Critical', success: 'Good', info: 'Info',
};

function CardSkeleton() {
  return (
    <div className="gv-card h-36 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[color:var(--border)] last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="relative overflow-hidden h-4 bg-[color:var(--muted)] rounded w-[75%]">
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                         bg-gradient-to-r from-transparent via-white/5 to-transparent"
              style={{ animationDelay: `${i * 70}ms` }}
            />
          </div>
          {i === 0 && (
            <div className="relative overflow-hidden h-3 bg-[color:var(--muted)] rounded w-40 mt-1.5">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                             bg-gradient-to-r from-transparent via-white/5 to-transparent"
                   style={{ animationDelay: '120ms' }} />
            </div>
          )}
        </td>
      ))}
    </tr>
  );
}

function TableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <div className="gv-card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <RowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  icon:     React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
}

function StatCard({ label, value, sub, icon, variant = 'default', onClick }: StatCardProps) {
  return (
    <div
      className={`gv-card flex flex-col gap-4 ${BORDER_CLS[variant]} ${
        onClick
          ? 'cursor-pointer hover:bg-[color:var(--gv-glass-bg-strong)] hover:border-[color:var(--gv-glass-border-hover)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] transition-all duration-200'
          : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="gv-icon-box">
          <span className={ICON_CLS[variant]}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          {variant !== 'default' && (
            <span className={`gv-tag ${TAG_CLS[variant as Exclude<Variant, 'default'>]}`}>
              {TAG_LABEL[variant as Exclude<Variant, 'default'>]}
            </span>
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

export default function StockRegistersPage() {
  const router = useRouter();
  const [tab,            setTab]            = useState<StockTab>('materials');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [search,         setSearch]         = useState('');

  const { data: sitesRaw, loading: isSitesLoading } = useApi<unknown>('/sites/list');
  const sites          = useMemo(() => extractList<Site>(sitesRaw), [sitesRaw]);
  const resolvedSiteId = selectedSiteId ?? sites[0]?.id ?? null;

  const {
    data: summary,
    loading: isSummaryLoading,
  } = useApi<StoreSummary>(
    `/store/site/${resolvedSiteId}`,
    { enabled: resolvedSiteId !== null },
  );

  const {
    data: matsRaw, loading: isMatsLoading, error: matsError, refetch: refetchMats,
  } = useApi<unknown>(
    `/store/materials/${resolvedSiteId}/all`,
    { enabled: resolvedSiteId !== null },
  );

  const {
    data: toolsRaw, loading: isToolsLoading, error: toolsError, refetch: refetchTools,
  } = useApi<unknown>(
    `/store/tools/${resolvedSiteId}/all`,
    { enabled: resolvedSiteId !== null },
  );

  const materials = useMemo(() => extractList<StoreMaterial>(matsRaw),  [matsRaw]);
  const tools     = useMemo(() => extractList<StoreTool>(toolsRaw),     [toolsRaw]);

  const q = search.toLowerCase();
  const filteredMaterials = useMemo(
    () => materials.filter((m) => m.name.toLowerCase().includes(q)),
    [materials, q],
  );
  const filteredTools = useMemo(
    () => tools.filter((t) => t.name.toLowerCase().includes(q)),
    [tools, q],
  );

  const lowCount = useMemo(
    () => materials.filter((m) => m.minimumStockLevel != null && m.quantity <= m.minimumStockLevel).length,
    [materials],
  );
  const outCount    = useMemo(() => materials.filter((m) => m.quantity === 0).length, [materials]);
  const availTool   = useMemo(
    () => tools.filter((t) => t.status?.toUpperCase() === 'AVAILABLE').length,
    [tools],
  );
  const overdueTool = useMemo(
    () => tools.filter((t) => (t as unknown as Record<string, unknown>).is_overdue === true).length,
    [tools],
  );
  const damagedTools = useMemo(
    () => tools.filter((t) => t.status?.toUpperCase() === 'DAMAGED').length,
    [tools],
  );

  const statCards = useMemo(() => {
    if (!summary || !resolvedSiteId) return [];
    return [
      {
        label:   'Total Materials',
        value:   summary.total_materials,
        sub:     'Tap to view material details',
        icon:    <Package size={18} />,
        variant: 'default' as Variant,
        onClick: () => router.push(`/stores/materials/${resolvedSiteId}`),
      },
      {
        label:   'Low Stock Items',
        value:   summary.low_stock_count,
        sub:     'Below minimum level',
        icon:    <TrendingDown size={18} />,
        variant: (summary.low_stock_count > 0 ? 'warn' : 'default') as Variant,
      },
      {
        label:   'Total Tools',
        value:   summary.total_tools,
        sub:     'Tap to view tools and their details',
        icon:    <Wrench size={18} />,
        variant: 'default' as Variant,
        onClick: () => router.push(`/stores/tools/${resolvedSiteId}`),
      },
      {
        label:   'Overdue Tools',
        value:   summary.overdue_tools ?? 0,
        sub:     'Past their hire end date',
        icon:    <XCircle size={18} />,
        variant: 'default' as Variant,
      },
      {
        label:   'Damaged Tools',
        value:   damagedTools,
        sub:     'Tools that need repair or replacement',
        icon:    <AlertOctagon size={18} />,
        variant: 'default' as Variant,
      },
      {
        label:   'Total Hire Cost',
        value:   fmtKES(summary.total_hire_cost ?? 0),
        sub:     'Active tool hire cost',
        icon:    <Coins size={18} />,
        variant: 'default' as Variant,
      },
    ];
  }, [summary, resolvedSiteId, damagedTools]);

  const showCardSkeletons = isSummaryLoading || (isSitesLoading && !summary);

  const isCurrentLoading = tab === 'materials'
    ? (isMatsLoading  && !materials.length)
    : (isToolsLoading && !tools.length);
  const isCurrentError = tab === 'materials'
    ? (matsError  && !materials.length)
    : (toolsError && !tools.length);

  const handleTabChange  = useCallback((t: StockTab) => { setTab(t); setSearch(''); }, []);
  const handleSiteChange = useCallback((id: number) => {
    setSelectedSiteId(id);
    setSearch('');
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Stock Registers</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={resolvedSiteId}
          onChange={handleSiteChange}
          isLoading={isSitesLoading}
        />
      </div>

      {showCardSkeletons && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!showCardSkeletons && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {!isMatsLoading && !isToolsLoading && resolvedSiteId && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="gv-tag">
            {materials.length} material{materials.length !== 1 ? 's' : ''}
          </span>
          {lowCount > 0 && (
            <span className="gv-tag border-[color:var(--gv-border-warn)] text-[color:var(--gv-text-warn)] flex items-center gap-1">
              <AlertTriangle size={10} /> {lowCount} low stock
            </span>
          )}
          {outCount > 0 && (
            <span className="gv-tag border-[color:var(--gv-border-danger)] text-[color:var(--destructive)] flex items-center gap-1">
              <XCircle size={10} /> {outCount} out of stock
            </span>
          )}
          <span className="gv-tag">
            {tools.length} tool{tools.length !== 1 ? 's' : ''}
          </span>
          {availTool > 0 && (
            <span className="gv-tag flex items-center gap-1">
              <CheckCircle2 size={10} /> {availTool} available
            </span>
          )}
          {overdueTool > 0 && (
            <span className="gv-tag flex items-center gap-1">
              <Clock size={10} /> {overdueTool} overdue
            </span>
          )}
          {damagedTools > 0 && (
            <span className="gv-tag border-[color:var(--gv-border-danger)] text-[color:var(--destructive)] flex items-center gap-1">
              <AlertOctagon size={10} /> {damagedTools} damaged
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--muted)]">
          {(['materials', 'tools'] as StockTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                tab === t
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                  : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {t === 'materials' ? <Package size={14} /> : <Wrench size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <input
            className="gv-input pl-9 h-9 text-sm"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isCurrentLoading && <TableSkeleton cols={tab === 'materials' ? 3 : 4} />}

      {!isCurrentLoading && isCurrentError && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center border-[color:var(--gv-border-danger)]">
          <AlertTriangle size={36} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)] mb-3">
            Failed to load {tab}. Please try again.
          </p>
          <button
            onClick={tab === 'materials' ? refetchMats : refetchTools}
            className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                       cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {!isCurrentLoading && !isCurrentError && tab === 'materials' && (
        <div className="gv-card p-0 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[30%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                {['Material', 'Quantity', 'Min. Level'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                         text-[color:var(--muted-foreground)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-[color:var(--muted-foreground)]">
                    <Package size={32} className="mx-auto mb-2 opacity-20" />
                    <p>{search ? 'No materials match your search' : 'No materials found'}</p>
                  </td>
                </tr>
              ) : filteredMaterials.map((mat) => {
                const unitLabel = mat.unit?.symbol ?? mat.unit?.name ?? '';
                return (
                  <tr
                    key={mat.id}
                    className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--accent)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <p>{mat.name}</p>
                      {mat.description && (
                        <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">{mat.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className="font-semibold">{mat.quantity}</span>
                      {unitLabel && (
                        <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">{unitLabel}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {mat.minimumStockLevel != null ? (
                        <>
                          <span className="font-medium">{mat.minimumStockLevel}</span>
                          {unitLabel && (
                            <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">{unitLabel}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[color:var(--muted-foreground)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isCurrentLoading && !isCurrentError && tab === 'tools' && (
        <div className="gv-card p-0 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[26%]" />
              <col className="w-[24%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                {['Tool', 'Vendor', 'Total Hire Cost (KES)', 'Hire End Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                         text-[color:var(--muted-foreground)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[color:var(--muted-foreground)]">
                    <Wrench size={32} className="mx-auto mb-2 opacity-20" />
                    <p>{search ? 'No tools match your search' : 'No tools found'}</p>
                  </td>
                </tr>
              ) : filteredTools.map((tool) => {
                const t = tool as unknown as Record<string, unknown>;
                const isOverdue     = t.is_overdue === true;
                const hireEndDate   = t.hire_end_date as string | undefined;
                const totalHireCost = t.totalHireCost as number | undefined;
                return (
                  <tr
                    key={tool.id}
                    className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--accent)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[color:var(--muted)] flex items-center justify-center shrink-0">
                          <Wrench size={13} className="text-[color:var(--muted-foreground)]" />
                        </div>
                        <div>
                          <p>{tool.name}</p>
                          {tool.status && (
                            <p className="text-[10px] text-[color:var(--muted-foreground)] mt-0.5 uppercase tracking-wide">
                              {tool.status}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                      {tool.vendor && tool.vendor !== 'string' ? tool.vendor : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {totalHireCost != null
                        ? totalHireCost.toLocaleString('en-KE', { minimumFractionDigits: 2 })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {hireEndDate ? (
                        <span className="flex items-center gap-1 text-xs text-[color:var(--muted-foreground)]">
                          {isOverdue && <Clock size={10} />}
                          {hireEndDate}
                          {isOverdue && (
                            <span className="ml-1 font-semibold text-[color:var(--foreground)]">· Overdue</span>
                          )}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}