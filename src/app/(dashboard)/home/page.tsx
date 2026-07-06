'use client';

import { useAuthStore } from '@/store/auth-store';
import { useHomeDashboard } from '@/hooks/home/useHomeDashboard';
import { WelcomeBanner } from '@/components/home/WelcomeBanner';
import { StatsGrid } from '@/components/home/StatsGrid';
import { RecentInvoicesCard } from '@/components/home/RecentInvoicesCard';
import { RecentUsersCard } from '@/components/home/RecentUsersCard';

export default function HomePage() {
  const { user, role } = useAuthStore();
  const {
    recentUsers, usersLoading,
    recentInvoices, invoicesLoading,
    kpis, kpisLoading,
  } = useHomeDashboard();

  return (
    <div className="space-y-8">
      <WelcomeBanner firstName={user?.first_name} role={role} />

      <StatsGrid kpis={kpis} loading={kpisLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInvoicesCard invoices={recentInvoices} loading={invoicesLoading} />
        <RecentUsersCard users={recentUsers} loading={usersLoading} />
      </div>
    </div>
  );
}