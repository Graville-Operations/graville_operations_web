import {
  Users, TrendingUp, Building2, Briefcase, Landmark, Receipt, FileText,
} from 'lucide-react';
import { OverviewKPIs } from '@/types/site';
import { InvoiceSummaryItem } from '@/types/invoice-summary';
import { ROUTES } from '@/lib/routes';
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
    totalPendingInvoices: 0,
    paidAmount: 0,
    totalPaidInvoices: 0,
  };
}

export function StatsGrid({ kpis, loading, invoiceSummary, invoiceSummaryLoading }: StatsGridProps) {
  const supplier = getSummary(invoiceSummary, 'supplier-invoice');
  const company = getSummary(invoiceSummary, 'company-invoice');
  const client = getSummary(invoiceSummary, 'client-invoice');
  const subcontractor = getSummary(invoiceSummary, 'subcontractor-invoice');

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {baseStats.map((stat) => (
        <StatCard key={stat.label} {...stat} loading={loading} />
      ))}

      <InvoiceSummaryStatCard
        name="Supplier Invoices"
        icon={Briefcase}
        iconBg="rgba(251,146,60,0.20)"
        iconColor="#fb923c"
        pendingAmount={supplier.pendingAmount}
        totalPendingInvoices={supplier.totalPendingInvoices}
        paidAmount={supplier.paidAmount}
        totalPaidInvoices={supplier.totalPaidInvoices}
        href={ROUTES.finance.invoice.supplier.list}
        loading={invoiceSummaryLoading}
      />

      <InvoiceSummaryStatCard
        name="Company Invoices"
        icon={Landmark}
        iconBg="rgba(96,165,250,0.20)"
        iconColor="#60a5fa"
        pendingAmount={company.pendingAmount}
        totalPendingInvoices={company.totalPendingInvoices}
        paidAmount={company.paidAmount}
        totalPaidInvoices={company.totalPaidInvoices}
        href={ROUTES.finance.invoice.company.list}
        loading={invoiceSummaryLoading}
      />

      <InvoiceSummaryStatCard
        name="Client Invoices"
        icon={Receipt}
        iconBg="rgba(51,144,124,0.20)"
        iconColor="#33907c"
        pendingAmount={client.pendingAmount}
        totalPendingInvoices={client.totalPendingInvoices}
        paidAmount={client.paidAmount}
        totalPaidInvoices={client.totalPaidInvoices}
        href={ROUTES.finance.invoice.client.list}
        loading={invoiceSummaryLoading}
      />

      <InvoiceSummaryStatCard
        name="Subcontractor Invoices"
        icon={FileText}
        iconBg="rgba(167,139,250,0.20)"
        iconColor="#a78bfa"
        pendingAmount={subcontractor.pendingAmount}
        totalPendingInvoices={subcontractor.totalPendingInvoices}
        paidAmount={subcontractor.paidAmount}
        totalPaidInvoices={subcontractor.totalPaidInvoices}
        href={ROUTES.finance.invoice.contractor}
        loading={invoiceSummaryLoading}
      />
    </div>
  );
}