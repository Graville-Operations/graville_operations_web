'use client';
import { useState, useMemo, useCallback } from 'react';
import {
  Search, Package, Wrench, ChevronDown,
  AlertTriangle, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { Site, StoreMaterial, StoreTool, StockTab } from '@/types/store';


function extractList<T>(raw: T[] | { items?: T[] } | null | undefined): T[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : (raw.items ?? []);
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
  const [tab,            setTab]            = useState<StockTab>('materials');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [search,         setSearch]         = useState('');

  const { data: sitesRaw, loading: isSitesLoading } =
    useApi<Site[] | { items: Site[] }>('/sites/list');

  const sites: Site[]  = useMemo(() => extractList(sitesRaw), [sitesRaw]);
  const resolvedSiteId = selectedSiteId ?? sites[0]?.id ?? null;

  const {
    data: matsRaw, loading: isMatsLoading, error: matsError, refetch: refetchMats,
  } = useApi<StoreMaterial[] | { items?: StoreMaterial[] }>(
    `/store/materials/${resolvedSiteId}/all`,
    { enabled: resolvedSiteId !== null },
  );

  const {
    data: toolsRaw, loading: isToolsLoading, error: toolsError, refetch: refetchTools,
  } = useApi<StoreTool[] | { items?: StoreTool[] }>(
    `/store/tools/${resolvedSiteId}/all`,
    { enabled: resolvedSiteId !== null },
  );

  const materials: StoreMaterial[] = useMemo(() => extractList(matsRaw),  [matsRaw]);
  const tools:     StoreTool[]     = useMemo(() => extractList(toolsRaw), [toolsRaw]);

  const q = search.toLowerCase();
  const filteredMaterials = useMemo(
    () => materials.filter((m) => m.name.toLowerCase().includes(q)),
    [materials, q],
  );
  const filteredTools = useMemo(
    () => tools.filter((t) => t.name.toLowerCase().includes(q)),
    [tools, q],
  );

  const lowCount  = useMemo(
    () => materials.filter((m) => m.minimumStockLevel !== null && m.quantity <= m.minimumStockLevel).length,
    [materials],
  );
  const outCount  = useMemo(() => materials.filter((m) => m.quantity === 0).length, [materials]);
  const availTool = useMemo(
    () => tools.filter((t) => t.status?.toUpperCase() === 'AVAILABLE').length,
    [tools],
  );

  const isCurrentLoading = tab === 'materials'
    ? (isMatsLoading  && !materials.length)
    : (isToolsLoading && !tools.length);

  const isCurrentError = tab === 'materials'
    ? (matsError  && !materials.length)
    : (toolsError && !tools.length);

  const handleTabChange  = useCallback((t: StockTab) => { setTab(t); setSearch(''); }, []);
  const handleSiteChange = useCallback((id: number)   => { setSelectedSiteId(id); setSearch(''); }, []);

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

      {!isMatsLoading && !isToolsLoading && resolvedSiteId && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="gv-tag">
            {materials.length} material{materials.length !== 1 ? 's' : ''}
          </span>

          {lowCount > 0 && (
            <span className="gv-tag border-[color:var(--gv-border-warn)] text-[color:var(--gv-text-warn)]
                             flex items-center gap-1">
              <AlertTriangle size={10} /> {lowCount} low stock
            </span>
          )}

          {outCount > 0 && (
            <span className="gv-tag border-[color:var(--gv-border-danger)] text-[color:var(--destructive)]
                             flex items-center gap-1">
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
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--muted)]">
          {(['materials', 'tools'] as StockTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2
                                       text-[color:var(--muted-foreground)]" />
          <input
            className="gv-input pl-9 h-9 text-sm"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isCurrentLoading && (
        <TableSkeleton cols={tab === 'materials' ? 3 : 4} />
      )}

      {!isCurrentLoading && isCurrentError && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center
                        border-[color:var(--gv-border-danger)]">
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
                    className="border-b border-[color:var(--border)] last:border-0
                               hover:bg-[color:var(--accent)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <p>{mat.name}</p>
                      {mat.description && (
                        <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                          {mat.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className="font-semibold">{mat.quantity}</span>
                      {unitLabel && (
                        <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">
                          {unitLabel}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {mat.minimumStockLevel != null ? (
                        <>
                          <span className="font-medium text-[color:var(--foreground)]">
                            {mat.minimumStockLevel}
                          </span>
                          {unitLabel && (
                            <span className="ml-1 text-xs text-[color:var(--muted-foreground)]">
                              {unitLabel}
                            </span>
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
              <col className="w-[20%]" />
              <col className="w-[28%]" />
              <col className="w-[26%]" />
              <col className="w-[26%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                {['Tool', 'Vendor', 'Hire Cost', 'Hire Period'].map((h) => (
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
              ) : filteredTools.map((tool) => (
                <tr
                  key={tool.id}
                  className="border-b border-[color:var(--border)] last:border-0
                             hover:bg-[color:var(--accent)] transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-[color:var(--muted)]
                                      flex items-center justify-center shrink-0">
                        <Wrench size={13} className="text-[color:var(--muted-foreground)]" />
                      </div>
                      <div>
                        <p>{tool.name}</p>
                        {tool.description && (
                          <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                            {tool.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                    {tool.vendor ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--muted-foreground)] tabular-nums">
                    {tool.hireCost != null
                      ? `KES ${tool.hireCost.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                    {tool.hire_start_date
                      ? `${new Date(tool.hire_start_date).toLocaleDateString()} – ${
                          tool.hire_end_date
                            ? new Date(tool.hire_end_date).toLocaleDateString()
                            : 'ongoing'
                        }`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}