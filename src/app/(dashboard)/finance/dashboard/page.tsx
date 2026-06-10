'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coins, FileText, AlertTriangle, RefreshCw,
  Building2, Users, Truck, HardHat, MapPin, ChevronRight, Search, X,
} from 'lucide-react';
import api from '@/lib/api';

interface Site {
  id:   number;
  name: string;
}

interface InvoiceItem {
  total: number;
}

interface PaginatedResponse {
  items: InvoiceItem[];
  total: number;
}

interface ApiEnvelope<T> {
  code:    number;
  data:    T;
  message: string;
}

interface InvoiceTypeStat {
  label:   string;
  icon:    React.ReactNode;
  count:   number;
  amount:  number;
  route:   string;
}

interface SiteStat {
  site:    Site;
  rows:    InvoiceTypeStat[];
  loading: boolean;
  error:   boolean;
}


function formatAmount(amount: number): string {
  return amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchInvoiceStat(
  endpoint: string,
  siteId: number,
): Promise<{ count: number; amount: number }> {
  const res = await api.get<ApiEnvelope<PaginatedResponse>>(
    `${endpoint}?site_id=${siteId}&limit=100`,
  );
  const data = res.data?.data;
  const count  = data?.total  ?? 0;
  const amount = (data?.items ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0);
  return { count, amount };
}

function CardSkeleton() {
  return (
    <div className="gv-card h-full w-full overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-3/5 rounded bg-white/5" />
            <div className="h-2.5 w-2/5 rounded bg-white/5" />
          </div>
        </div>
        <div className="border-t border-white/5" />
        <div className="flex gap-2 pb-1">
          <div className="h-2.5 w-2/5 rounded bg-white/5" />
          <div className="h-2.5 w-6 rounded bg-white/5 ml-auto" />
          <div className="h-2.5 w-12 rounded bg-white/5" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg py-2 px-1">
            <div className="h-5 w-5 rounded bg-white/5 flex-shrink-0" />
            <div className="h-3 flex-1 rounded bg-white/5" />
            <div className="h-3 w-5 rounded bg-white/5" />
            <div className="h-3 w-14 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteExpenseCard({ siteStat, onRetry }: { siteStat: SiteStat; onRetry: () => void }) {
  const router = useRouter();

  if (siteStat.loading) return <CardSkeleton />;

  if (siteStat.error) {
    return (
      <div className="gv-card h-full w-full flex flex-col items-center justify-center
                      text-center border-[color:var(--gv-border-danger)]">
        <AlertTriangle size={22} className="text-[color:var(--destructive)] opacity-40 mb-2" />
        <p className="text-xs text-[color:var(--muted-foreground)] mb-3">Failed to load</p>
        <button
          onClick={onRetry}
          className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                     cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={10} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="gv-card h-full w-full flex flex-col gap-3">

      <div className="flex items-center gap-2">
        <div className="gv-icon-box flex-shrink-0">
          <Building2 size={14} className="text-[color:var(--primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[color:var(--foreground)] leading-tight truncate">
            {siteStat.site.name}
          </p>
          <p className="gv-eyebrow text-[10px] mt-0.5">Site Expenses</p>
        </div>
      </div>

      <div className="border-t border-[color:var(--gv-glass-border)]" />

  
      <div className="grid grid-cols-[1fr_2rem_5.5rem] gap-x-1 px-2 pb-0.5">
        <span className="text-[10px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide">
          Expense
        </span>
        <span className="text-[10px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide text-right">
          No.
        </span>
        <span className="text-[10px] font-medium text-[color:var(--muted-foreground)] uppercase tracking-wide text-right">
          Total (KES)
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {siteStat.rows.map((row) => (
          <button
            key={row.label}
            onClick={() => router.push(row.route)}
            className="w-full grid grid-cols-[1fr_2rem_5.5rem] gap-x-1 items-center
                       px-2 py-2 rounded-lg text-left
                       bg-transparent border border-transparent
                       hover:bg-[color:var(--gv-glass-bg-strong)]
                       hover:border-[color:var(--gv-glass-border)]
                       active:scale-[0.98]
                       transition-all duration-150 group"
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="text-[color:var(--primary)] opacity-60 group-hover:opacity-100 flex-shrink-0 transition-opacity">
                {row.icon}
              </span>
              <span className="text-[11px] text-[color:var(--foreground)] group-hover:text-[color:var(--primary)]
                               transition-colors leading-tight truncate ">
                {row.label}
              </span>
            </span>

            <span className="text-[11px] text-[color:var(--muted-foreground)] text-right tabular-nums">
              {row.count}
            </span>

            <span className="flex items-center gap-0.5 justify-end">
              <span className="text-[11px] font-semibold text-[color:var(--foreground)] tabular-nums">
                {row.amount > 0 ? formatAmount(row.amount) : '—'}
              </span>
              <ChevronRight
                size={10}
                className="text-[color:var(--gv-text-faint)] opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FinanceDashboardPage() {
  const [siteStats,    setSiteStats]    = useState<SiteStat[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError,   setSitesError]   = useState(false);
  const [siteSearch,   setSiteSearch]   = useState('');

  const loadSiteStats = useCallback(async (siteList?: Site[]) => {
    let sites: Site[] = siteList ?? [];
    if (!siteList) {
      try {
        const res = await api.get<ApiEnvelope<{ items: Site[] }>>('/sites/list?limit=100');
        sites = res.data?.data?.items ?? [];
        setSitesError(false);
      } catch {
        setSitesError(true);
        setSitesLoading(false);
        return;
      }
    }
    setSitesLoading(false);

    setSiteStats(
      sites.map((site) => ({ site, rows: [], loading: true, error: false })),
    );

    sites.forEach(async (site) => {
      try {
        const [client, supplier, subcontractor, company] = await Promise.all([
          fetchInvoiceStat('/client-invoices/all',        site.id),
          fetchInvoiceStat('/invoices/all',               site.id),
          fetchInvoiceStat('/subcontractor-invoices/all', site.id),
          fetchInvoiceStat('/company-invoices/all',       site.id),
        ]);

        const rows: InvoiceTypeStat[] = [
          { label: 'Client Invoice',         icon: <Users size={11} />,     count: client.count,        amount: client.amount,        route: `/finance/invoice/client?site_id=${site.id}` },
          { label: 'Supplier Invoice',       icon: <Truck size={11} />,     count: supplier.count,      amount: supplier.amount,      route: `/finance/invoice/supplier?site_id=${site.id}` },
          { label: 'Sub-Contractor Invoice', icon: <HardHat size={11} />,   count: subcontractor.count, amount: subcontractor.amount, route: `/finance/invoice/contractor?site_id=${site.id}` },
          { label: 'Company Invoice',        icon: <Building2 size={11} />, count: company.count,       amount: company.amount,       route: `/finance/invoice/company?site_id=${site.id}` },
        ];

        setSiteStats((prev) =>
          prev.map((s) =>
            s.site.id === site.id ? { ...s, rows, loading: false, error: false } : s,
          ),
        );
      } catch {
        setSiteStats((prev) =>
          prev.map((s) =>
            s.site.id === site.id ? { ...s, loading: false, error: true } : s,
          ),
        );
      }
    });
  }, []);

  useEffect(() => { loadSiteStats(); }, [loadSiteStats]);

  const retryAll = () => {
    setSitesLoading(true);
    setSitesError(false);
    setSiteStats([]);
    loadSiteStats();
  };

  const retrySite = (site: Site) => {
    setSiteStats((prev) =>
      prev.map((s) => (s.site.id === site.id ? { ...s, loading: true, error: false } : s)),
    );
    (async () => {
      try {
        const [client, supplier, subcontractor, company] = await Promise.all([
          fetchInvoiceStat('/client-invoices/all',        site.id),
          fetchInvoiceStat('/invoices/all',               site.id),
          fetchInvoiceStat('/subcontractor-invoices/all', site.id),
          fetchInvoiceStat('/company-invoices/all',       site.id),
        ]);
        const rows: InvoiceTypeStat[] = [
          { label: 'Client Invoice',         icon: <Users size={11} />,     count: client.count,        amount: client.amount,        route: `/finance/invoice/client?site_id=${site.id}` },
          { label: 'Supplier Invoice',       icon: <Truck size={11} />,     count: supplier.count,      amount: supplier.amount,      route: `/finance/invoice/supplier?site_id=${site.id}` },
          { label: 'Sub-Contractor Invoice', icon: <HardHat size={11} />,   count: subcontractor.count, amount: subcontractor.amount, route: `/finance/invoice/contractor?site_id=${site.id}` },
          { label: 'Company Invoice',        icon: <Building2 size={11} />, count: company.count,       amount: company.amount,       route: `/finance/invoice/company?site_id=${site.id}` },
        ];
        setSiteStats((prev) =>
          prev.map((s) => (s.site.id === site.id ? { ...s, rows, loading: false, error: false } : s)),
        );
      } catch {
        setSiteStats((prev) =>
          prev.map((s) => (s.site.id === site.id ? { ...s, loading: false, error: true } : s)),
        );
      }
    })();
  };

  const filteredStats = siteSearch.trim()
    ? siteStats.filter((s) =>
        s.site.name.toLowerCase().includes(siteSearch.trim().toLowerCase()),
      )
    : siteStats;

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Finance</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Coins size={13} className="text-[color:var(--primary)]" />
        <span className="text-sm text-[color:var(--muted-foreground)]">
          Financial overview across all sites and invoice types
        </span>
      </div>

      <div className="gv-card flex items-start gap-4">
        <div className="gv-icon-box flex-shrink-0">
          <FileText size={18} className="text-[color:var(--primary)]" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium text-[color:var(--foreground)]">Finance Overview</p>
          <p className="text-sm text-[color:var(--muted-foreground)] leading-relaxed">
            Consolidated view of all financial activity across this company. Each card below
            represents a site, tap any expense row to view the full invoice list for that
            category on that site.
          </p>
        </div>
      </div>

      {sitesError && (
        <div className="gv-card flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle size={28} className="text-[color:var(--destructive)] opacity-40 mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)] mb-4">Failed to load sites</p>
          <button
            onClick={retryAll}
            className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                       cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={10} /> Retry
          </button>
        </div>
      )}

      {!sitesError && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold text-[color:var(--foreground)] shrink-0">
              Site Expenses
            </h2>
            {!sitesLoading && siteStats.length > 0 && (
              <div className="relative flex items-center max-w-[220px] w-full">
                <Search size={12} className="absolute left-2.5 text-[color:var(--muted-foreground)] pointer-events-none" />
                <input
                  type="text"
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  placeholder="Search site…"
                  className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg
                             bg-[color:var(--gv-glass-bg)] border border-[color:var(--gv-glass-border)]
                             text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)]
                             focus:outline-none focus:border-[color:var(--primary)]
                             transition-colors"
                />
                {siteSearch && (
                  <button
                    onClick={() => setSiteSearch('')}
                    className="absolute right-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            )}
          </div>

          {sitesLoading ? (
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : siteStats.length === 0 ? (
            <div className="gv-card flex flex-col items-center justify-center py-10 text-center">
              <MapPin size={28} className="opacity-20 mb-3" />
              <p className="text-sm text-[color:var(--muted-foreground)]">No sites found</p>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="gv-card flex flex-col items-center justify-center py-10 text-center">
              <Search size={24} className="opacity-20 mb-3" />
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No sites match &ldquo;{siteSearch}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {filteredStats.map((s) => (
                <SiteExpenseCard
                  key={s.site.id}
                  siteStat={s}
                  onRetry={() => retrySite(s.site)}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}