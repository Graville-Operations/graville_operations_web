'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Building2, ChevronRight, RefreshCw, Users, Truck, HardHat } from 'lucide-react';
import { SiteStat, InvoiceTypeKey } from '@/types/finance-dashboard';
import { CardSkeleton } from './CardSkeleton';
import { formatAmount } from './format';

const ROW_ICONS: Record<InvoiceTypeKey, React.ReactNode> = {
  client:        <Users size={11} />,
  supplier:      <Truck size={11} />,
  subcontractor: <HardHat size={11} />,
};

interface SiteExpenseCardProps {
  siteStat: SiteStat;
  onRetry:  () => void;
}

export function SiteExpenseCard({ siteStat, onRetry }: SiteExpenseCardProps) {
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
                {ROW_ICONS[row.key]}
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