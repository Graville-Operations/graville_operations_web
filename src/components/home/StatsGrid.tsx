import {
  Users, Briefcase, TrendingUp, Building2,
} from 'lucide-react';
import { OverviewKPIs } from '@/types/site';
import { ROUTES } from '@/lib/routes';
import { StatCard } from './StatCard';

interface StatsGridProps {
  kpis: OverviewKPIs | null;
  loading: boolean;
}

export function StatsGrid({ kpis, loading }: StatsGridProps) {
  const stats = [
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
      label: 'Pending Invoices',
      value: kpis?.pendingInvoiceValue ?? 0,
      icon: Briefcase,
      iconBg: 'rgba(251,146,60,0.20)',
      iconColor: '#fb923c',
      change: `${kpis?.totalInvoiced ?? 0} total`,
      positive: false,
      href: ROUTES.finance.invoices,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} loading={loading} />
      ))}
    </div>
  );
}