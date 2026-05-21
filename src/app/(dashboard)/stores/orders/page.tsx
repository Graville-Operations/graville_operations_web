'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  ChevronDown, Activity, PackageCheck, Calendar,
  ClipboardList, ChevronRight, CheckCircle2, Clock,
  XCircle, Package,
} from 'lucide-react';

interface Site { id: number; name: string; }

interface DailyUsageItem {
  material: { name: string; unit: { symbol: string } };
  quantity_used: number; notes?: string;
}
interface DailyUsageRecord {
  id: number; usage_date: string; status: string;
  notes?: string; items: DailyUsageItem[];
}
interface ReceiptRecord {
  id: number;
  material: { name: string; unit: { symbol: string } };
  quantity: number; unit_price: number; notes?: string; received_at: string;
}

const USAGE_STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  DRAFT:     { label: 'Draft',     cls: 'border-white/20 text-muted-foreground',  icon: <Clock size={11} />         },
  SUBMITTED: { label: 'Submitted', cls: 'border-blue-500/30 text-blue-400',       icon: <ClipboardList size={11} /> },
  APPROVED:  { label: 'Approved',  cls: 'border-green-500/30 text-green-400',     icon: <CheckCircle2 size={11} />  },
  REJECTED:  { label: 'Rejected',  cls: 'border-destructive/30 text-destructive', icon: <XCircle size={11} />       },
};

type ActiveTab = 'usage' | 'receipts';

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

export default function StoreActivityPage() {
  const [tab, setTab]                             = useState<ActiveTab>('usage');
  const [sites, setSites]                         = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId]       = useState<number | null>(null);
  const [usageLogs, setUsageLogs]                 = useState<DailyUsageRecord[]>([]);
  const [receipts, setReceipts]                   = useState<ReceiptRecord[]>([]);
  const [expandedUsage, setExpandedUsage]         = useState<Set<number>>(new Set());
  const [isSitesLoading, setIsSitesLoading]       = useState(true);
  const [isUsageLoading, setIsUsageLoading]       = useState(false);
  const [isReceiptsLoading, setIsReceiptsLoading] = useState(false);

  useEffect(() => {
    api.get('/sites/list')
      .then((res) => {
        const raw = res.data?.data;
        const list: Site[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setSites(list);
        if (list.length > 0) setSelectedSiteId(list[0].id);
      })
      .catch(console.error)
      .finally(() => setIsSitesLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSiteId === null) return;

    setIsUsageLoading(true);
    api.get('/daily-usage/all', { params: { site_id: selectedSiteId } })
      .then((res) => {
        const raw = res.data?.data;
        setUsageLogs(Array.isArray(raw) ? raw : (raw?.items ?? []));
      })
      .catch(() => setUsageLogs([]))
      .finally(() => setIsUsageLoading(false));

    setIsReceiptsLoading(true);
    api.get(`/store/site/${selectedSiteId}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setReceipts(data?.receipts ?? data?.receipt_history ?? data?.material_receipts ?? []);
      })
      .catch(() => setReceipts([]))
      .finally(() => setIsReceiptsLoading(false));
  }, [selectedSiteId]);

  const toggleExpand = (id: number) => {
    setExpandedUsage((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalUsageItems   = usageLogs.reduce((sum, r) => sum + (r.items?.length ?? 0), 0);
  const totalReceiptValue = receipts.reduce((sum, r)  => sum + r.quantity * r.unit_price, 0);
  const selectedSite      = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Store Activity</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={selectedSiteId}
          onChange={setSelectedSiteId}
          isLoading={isSitesLoading}
        />
      </div>

      {selectedSite && !isUsageLoading && !isReceiptsLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Usage Logs',    value: usageLogs.length, icon: <ClipboardList size={15} className="text-primary" />  },
            { label: 'Usage Items',   value: totalUsageItems,  icon: <Package size={15} className="text-blue-400" />       },
            { label: 'Receipts',      value: receipts.length,  icon: <PackageCheck size={15} className="text-green-400" /> },
            {
              label: 'Total Received',
              value: `$${totalReceiptValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: <Activity size={15} className="text-yellow-400" />,
            },
          ].map((s) => (
            <div key={s.label} className="gv-card flex items-center gap-3 py-3">
              <div className="gv-icon-box w-9 h-9 shrink-0">{s.icon}</div>
              <div>
                <p className="gv-label">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
        {([
          { key: 'usage',    label: 'Daily Usage', icon: <ClipboardList size={14} /> },
          { key: 'receipts', label: 'Receipts',    icon: <PackageCheck size={14} />  },
        ] as { key: ActiveTab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Daily Usage tab */}
      {tab === 'usage' && (
        isUsageLoading
          ? <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="gv-card h-16 animate-pulse" />)}</div>
          : usageLogs.length === 0
          ? (
            <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList size={36} className="text-muted-foreground opacity-20 mb-3" />
              <p className="text-sm text-muted-foreground">No daily usage logs for this site</p>
            </div>
          ) : (
            <div className="space-y-2">
              {usageLogs.map((log) => {
                const meta   = USAGE_STATUS_META[log.status?.toUpperCase()] ?? USAGE_STATUS_META.DRAFT;
                const isOpen = expandedUsage.has(log.id);
                return (
                  <div key={log.id} className="gv-card p-0 overflow-hidden">
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-accent/30 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Calendar size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {new Date(log.usage_date).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                        {log.notes && <p className="text-xs text-muted-foreground truncate">{log.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {log.items?.length ?? 0} item{(log.items?.length ?? 0) !== 1 ? 's' : ''}
                        </span>
                        <span className={`gv-tag flex items-center gap-1 ${meta.cls}`}>{meta.icon} {meta.label}</span>
                        <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-border">
                        {!log.items?.length ? (
                          <p className="px-4 py-3 text-xs text-muted-foreground">No items recorded</p>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-muted/30">
                                {['Material', 'Qty Used', 'Notes'].map((h) => (
                                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {log.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                                  <td className="px-4 py-2.5 font-medium">{item.material?.name}</td>
                                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                                    {item.quantity_used} {item.material?.unit?.symbol}
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{item.notes ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
      )}

      {/* Receipts tab */}
      {tab === 'receipts' && (
        isReceiptsLoading
          ? <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="gv-card h-16 animate-pulse" />)}</div>
          : receipts.length === 0
          ? (
            <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
              <PackageCheck size={36} className="text-muted-foreground opacity-20 mb-3" />
              <p className="text-sm text-muted-foreground">No receipts recorded for this site</p>
            </div>
          ) : (
            <div className="gv-card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Material', 'Qty', 'Unit Price', 'Total', 'Notes', 'Received'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Package size={12} className="text-primary" />
                          </div>
                          {r.material?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{r.quantity} {r.material?.unit?.symbol}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">${r.unit_price?.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">${(r.quantity * r.unit_price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{r.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(r.received_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/20">
                    <td colSpan={3} className="px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Total received value
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums">
                      ${totalReceiptValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )
      )}
    </div>
  );
}