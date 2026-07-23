// src/components/home/StatsGrid.tsx
import { Users, TrendingUp, Building2 } from 'lucide-react';
import { OverviewKPIs } from '@/types/site';
import { InvoiceSummaryItem } from '@/types/invoice-summary';
import { ROUTES } from '@/lib/routes';
import { INVOICE_SUMMARY_CONFIG, INVOICE_SUMMARY_ORDER } from '@/lib/invoice-summary-config';
import { StatCard } from './StatCard';
import { InvoiceSummaryStatCard } from './InvoiceSummaryStatCard';

interface StatsGridProps {
  kpis: OverviewKPIs | null;
  loading: boolean;
  invoiceSummary: InvoiceSummaryItem[];
  invoiceSummaryLoading: boolean;
}

function getSummary(items: InvoiceSummaryItem[], id: string): InvoiceSummaryItem {
  return items.find((item) => item.id === id) ?? {
    id,
    name: '',
    pendingAmount: 0,
    pendingCount: 0,
    partiallyPaidInvoiceTotal: 0,
    partiallyPaidAmountPaid: 0,
    partiallyPaidBalanceDue: 0,
    partiallyPaidCount: 0,
    paidAmount: 0,
    paidCount: 0,
    rejectedAmount: 0,
    rejectedCount: 0,
    totalInvoiceCount: 0,
    totalAmountPaid: 0,
    totalRemainingBalance: 0,
  };
}

export function StatsGrid({ kpis, loading, invoiceSummary, invoiceSummaryLoading }: StatsGridProps) {
  const baseStats = [
    {
      label: 'Total Sites',
      value: kpis?.totalSites ?? 0,
      icon: Building2,
      iconBg: 'rgba(96,165,250,0.20)',
      iconColor: '#60a5fa',
      change: `${kpis?.activeSites ?? 0} active`,
      positive: true,
      href: ROUTES.projects.dashboard,
    },
    {
      label: 'Total Workers',
      value: kpis?.totalWorkers ?? 0,
      icon: Users,
      iconBg: 'rgba(51,144,124,0.20)',
      iconColor: '#33907c',
      change: `${kpis?.presentToday ?? 0} today`,
      positive: true,
      href: ROUTES.workers,
    },
    {
      label: 'Completed Tasks',
      value: kpis?.completedTasks ?? 0,
      icon: TrendingUp,
      iconBg: 'rgba(167,139,250,0.20)',
      iconColor: '#a78bfa',
      change: `${kpis?.totalTasks ?? 0} total`,
      positive: true,
      href: ROUTES.projects.dashboard,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INVOICE_SUMMARY_ORDER.map((id) => {
          const summary = getSummary(invoiceSummary, id);
          const config = INVOICE_SUMMARY_CONFIG[id];

          return (
            <InvoiceSummaryStatCard
              key={id}
              name={config.label}
              icon={config.icon}
              iconBg={config.iconBg}
              iconColor={config.iconColor}
              totalAmountPaid={summary.totalAmountPaid}
              totalRemainingBalance={summary.totalRemainingBalance}
              totalInvoiceCount={summary.totalInvoiceCount}
              href={ROUTES.homeInvoices.detail(id)}
              loading={invoiceSummaryLoading}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {baseStats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </div>
    </div>
  );
}