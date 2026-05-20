'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Search, Package, Wrench, ChevronDown, AlertTriangle, CheckCircle2, XCircle, Minus } from 'lucide-react';

type Tab = 'materials' | 'tools';

interface Site {
  id: number;
  name: string;
}

interface StoreMaterial {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  minimumStockLevel: number | null;
  unit: { id: number; name: string; symbol: string };
}

interface StoreTool {
  id: number;
  name: string;
  description?: string;
  status: string;
  vendor?: string;
  billing_type?: string;
  hireCost?: number;
  hire_start_date?: string;
  hire_end_date?: string;
}

const TOOL_STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  AVAILABLE:         { label: 'Available',   cls: 'border-green-500/30 text-green-400',     icon: <CheckCircle2 size={11} /> },
  IN_USE:            { label: 'In Use',      cls: 'border-blue-500/30 text-blue-400',       icon: <Wrench size={11} /> },
  UNDER_MAINTENANCE: { label: 'Maintenance', cls: 'border-yellow-500/30 text-yellow-400',   icon: <AlertTriangle size={11} /> },
  DAMAGED:           { label: 'Damaged',     cls: 'border-destructive/30 text-destructive', icon: <XCircle size={11} /> },
  RETIRED:           { label: 'Retired',     cls: 'border-white/20 text-muted-foreground',  icon: <Minus size={11} /> },
};

function stockStatus(m: StoreMaterial) {
  if (m.quantity === 0) return { label: 'Out of stock', cls: 'border-destructive/30 text-destructive' };
  if (m.minimumStockLevel !== null && m.quantity <= m.minimumStockLevel)
    return { label: 'Low stock', cls: 'border-yellow-500/30 text-yellow-400' };
  return { label: 'In stock', cls: 'border-green-500/30 text-green-400' };
}

export default function StockRegistersPage() {
  const [tab, setTab] = useState<Tab>('materials');
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<StoreMaterial[]>([]);
  const [tools, setTools] = useState<StoreTool[]>([]);
  const [search, setSearch] = useState('');
  const [isSitesLoading, setIsSitesLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Load sites
  useEffect(() => {
    setIsSitesLoading(true);
    api
      .get('/sites/list')
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        const list: Site[] = Array.isArray(raw) ? raw : [];
        setSites(list);
        if (list.length > 0) setSelectedSiteId(list[0].id);
      })
      .catch((err) => {
        console.error('Failed to load sites:', err);
        setSites([]);
      })
      .finally(() => setIsSitesLoading(false));
  }, []);

  // Load materials + tools
  useEffect(() => {
    if (!selectedSiteId) return;

    const controller = new AbortController();
    setIsDataLoading(true);
    setSearch('');

    Promise.all([
      api.get(`/sites/${selectedSiteId}/store/materials`),
      api.get(`/sites/${selectedSiteId}/store/tools`),
    ])
      .then(([matsRes, toolsRes]) => {
        if (!controller.signal.aborted) {
          setMaterials(matsRes.data?.data ?? matsRes.data ?? []);
          setTools(toolsRes.data?.data ?? toolsRes.data ?? []);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsDataLoading(false);
      });

    return () => controller.abort();
  }, [selectedSiteId]);

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTools = tools.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = materials.filter((m) => m.minimumStockLevel !== null && m.quantity <= m.minimumStockLevel).length;
  const outCount = materials.filter((m) => m.quantity === 0).length;
  const availTool = tools.filter((t) => t.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Stock Registers</h1>
        </div>

        <div className="relative w-full sm:w-64">
          {isSitesLoading ? (
            <div className="gv-input h-10 animate-pulse bg-muted" />
          ) : (
            <div className="relative">
              <select
                className="gv-input appearance-none pr-9 h-10 text-sm cursor-pointer"
                value={selectedSiteId ?? ''}
                onChange={(e) => setSelectedSiteId(e.target.value ? Number(e.target.value) : null)}
              >
                {sites.length === 0 && <option value="">No sites available</option>}
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {!isDataLoading && selectedSiteId && (
        <div className="flex flex-wrap gap-2">
          <span className="gv-tag border-white/12">{materials.length} material{materials.length !== 1 ? 's' : ''}</span>
          {lowCount > 0 && <span className="gv-tag border-yellow-500/30 text-yellow-400 flex items-center gap-1"><AlertTriangle size={10} /> {lowCount} low stock</span>}
          {outCount > 0 && <span className="gv-tag border-destructive/30 text-destructive flex items-center gap-1"><XCircle size={10} /> {outCount} out of stock</span>}
          <span className="gv-tag border-white/12">{tools.length} tool{tools.length !== 1 ? 's' : ''}</span>
          {availTool > 0 && <span className="gv-tag border-green-500/30 text-green-400 flex items-center gap-1"><CheckCircle2 size={10} /> {availTool} available</span>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(['materials', 'tools'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'materials' ? <Package size={14} /> : <Wrench size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="gv-input pl-9 h-9 text-sm"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isDataLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="gv-card h-14 animate-pulse" />)}
        </div>
      )}

      {!isDataLoading && tab === 'materials' && (
        <div className="gv-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Material', 'Unit', 'Quantity', 'Min. Level', 'Stock Bar', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Package size={32} className="mx-auto mb-2 opacity-20" />
                    <p>No materials found</p>
                  </td>
                </tr>
              ) : filteredMaterials.map((mat) => {
                const st = stockStatus(mat);
                const pct = mat.minimumStockLevel && mat.minimumStockLevel > 0
                  ? Math.min(100, Math.round((mat.quantity / (mat.minimumStockLevel * 2)) * 100))
                  : mat.quantity > 0 ? 100 : 0;

                return (
                  <tr key={mat.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <p>{mat.name}</p>
                      {mat.description && <p className="text-xs text-muted-foreground">{mat.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{mat.unit?.symbol ?? mat.unit?.name}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{mat.quantity}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{mat.minimumStockLevel ?? '—'}</td>
                    <td className="px-4 py-3 w-28">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${mat.quantity === 0 ? 'bg-destructive' : mat.minimumStockLevel !== null && mat.quantity <= mat.minimumStockLevel ? 'bg-yellow-400' : 'bg-green-400'}`} 
                             style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`gv-tag flex items-center gap-1 w-fit ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isDataLoading && tab === 'tools' && (
        <div className="gv-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Tool', 'Status', 'Billing', 'Vendor', 'Hire Cost', 'Hire Period'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Wrench size={32} className="mx-auto mb-2 opacity-20" />
                    <p>No tools found</p>
                  </td>
                </tr>
              ) : filteredTools.map((tool) => {
                const meta = TOOL_STATUS_META[tool.status?.toUpperCase()] ?? { label: tool.status, cls: 'text-muted-foreground border-white/20', icon: null };
                return (
                  <tr key={tool.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <Wrench size={13} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p>{tool.name}</p>
                          {tool.description && <p className="text-xs text-muted-foreground">{tool.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`gv-tag flex items-center gap-1 w-fit ${meta.cls}`}>{meta.icon} {meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{tool.billing_type?.replace('_', ' ') ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tool.vendor ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {tool.hireCost != null ? `$${tool.hireCost.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {tool.hire_start_date ? `${new Date(tool.hire_start_date).toLocaleDateString()} – ${tool.hire_end_date ? new Date(tool.hire_end_date).toLocaleDateString() : 'ongoing'}` : '—'}
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