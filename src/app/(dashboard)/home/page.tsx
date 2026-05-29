'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
//import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUserStore } from '@/store/user-store';
import { useInvoiceStore } from '@/store/invoice-store';
import api from '@/lib/api';
import { fetchOverviewKPIs } from '@/lib/api/sites';
import { OverviewKPIs } from '@/types/site';
import {
  Users, BarChart2, Briefcase, TrendingUp,
  ArrowRight, Clock, Receipt, CheckCircle2,
  AlertCircle, Loader2, UserCircle, Building2,
} from 'lucide-react';
// import { ApiUser } from '@/types';
// import { InvoiceItem } from '@/store/invoice-store';

function StatusIcon({ status }: { status?: string }) {
  if (!status) return null;
  if (status === 'FULLY_PAID')
    return <CheckCircle2 size={14} style={{ color: '#33907c' }} />;
  if (status === 'REJECTED')
    return <AlertCircle size={14} style={{ color: '#f87171' }} />;
  return <Clock size={14} style={{ color: '#fb923c' }} />;
}

function StatCard({
  label, value, icon: Icon, iconBg, iconColor, change, positive, href, loading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  change?: string;
  positive?: boolean;
  href?: string;
  loading?: boolean;
}) {
  const content = (
    <div className="gv-card gv-stat-card p-5 flex flex-col gap-4 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        {change && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: positive ? 'rgba(51,144,124,0.15)' : 'rgba(248,113,113,0.12)',
              color: positive ? '#33907c' : '#f87171',
              border: `1px solid ${positive ? 'rgba(51,144,124,0.25)' : 'rgba(248,113,113,0.20)'}`,
            }}
          >
            {change}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-16 rounded-md animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
      ) : (
        <p className="text-2xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          {value}
        </p>
      )}
      <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return <div>{content}</div>;
}

export default function HomePage() {
  const { user, role } = useAuthStore();

  const { users, isLoaded: usersLoaded, setUsers } = useUserStore();
  const [usersLoading, setUsersLoading] = useState(!usersLoaded);
  const recentUsers = users.slice(0, 5);

  const { invoices, isLoaded: invoicesLoaded, setInvoices } = useInvoiceStore();
  const [invoicesLoading, setInvoicesLoading] = useState(!invoicesLoaded);
  const recentInvoices = invoices.slice(0, 5);

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchOverviewKPIs()
      .then((res) => {
        const kpiData = (res as unknown as { data?: OverviewKPIs }).data ?? res;
        setKpis(kpiData as OverviewKPIs);
      })
      .catch(console.error)
      .finally(() => setKpisLoading(false));

    if (!usersLoaded) {
      api.get('/users/list')
        .then(({ data }) => {
          const payload = data?.data ?? data;
          const list = Array.isArray(payload) ? payload : payload?.items ?? [];
          setUsers(list);
        })
        .catch(console.error)
        .finally(() => setUsersLoading(false));
    }

    if (!invoicesLoaded) {
      api.get('/invoices/all?limit=5')
        .then(({ data }) => {
          const payload = data?.data ?? data;
          const list = Array.isArray(payload)
            ? payload
            : payload?.items ?? payload?.results ?? [];
          setInvoices(list);
        })
        .catch(console.error)
        .finally(() => setInvoicesLoading(false));
    }
  }, [invoicesLoaded, setInvoices, setUsers, usersLoaded]);

  const stats = [
    {
      label: 'Total Sites',
      value: kpis?.totalSites ?? 0,
      icon: Building2,
      iconBg: 'rgba(96,165,250,0.20)',
      iconColor: '#60a5fa',
      change: `${kpis?.activeSites ?? 0} active`,
      positive: true,
      href: '/projects/dashboard',
    },
    {
      label: 'Total Workers',
      value: kpis?.totalWorkers ?? 0,
      icon: Users,
      iconBg: 'rgba(51,144,124,0.20)',
      iconColor: '#33907c',
      change: `${kpis?.presentToday ?? 0} today`,
      positive: true,
      href: '/workers',
    },
    {
      label: 'Pending Invoices',
      value: kpis?.pendingInvoiceValue ?? 0,
      icon: Briefcase,
      iconBg: 'rgba(251,146,60,0.20)',
      iconColor: '#fb923c',
      change: `${kpis?.totalInvoiced ?? 0} total`,
      positive: false,
      href: '/finance/invoices/supplier',
    },
    {
      label: 'Completed Tasks',
      value: kpis?.completedTasks ?? 0,
      icon: TrendingUp,
      iconBg: 'rgba(167,139,250,0.20)',
      iconColor: '#a78bfa',
      change: `${kpis?.totalTasks ?? 0} total`,
      positive: true,
      href: '/projects/dashboard',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(51,144,124,0.30) 0%, rgba(23,57,144,0.25) 100%)',
          border: '1px solid rgba(51,144,124,0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(51,144,124,0.18) 0%, transparent 70%)' }}
        />
        <div className="relative">
          <p className="gv-eyebrow mb-2">Dashboard</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            {greeting}, {user?.first_name ?? 'there'} 👋
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            <span
              className="font-semibold mr-2 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: 'rgba(51,144,124,0.20)',
                color: '#33907c',
                border: '1px solid rgba(51,144,124,0.30)',
              }}
            >
              {role}
            </span>
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={kpisLoading} />
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Invoices */}
        <div className="gv-card overflow-hidden flex flex-col" style={{ padding: 0 }}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
          >
            <div className="flex items-center gap-2">
              <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                <Receipt size={15} style={{ color: '#33907c' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--gv-text-primary)' }}>
                Recent Invoices
              </h3>
            </div>
            <Link href="/finance/invoices" className="flex items-center gap-1 text-xs font-medium" style={{ color: '#33907c' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex-1 px-5 py-3 space-y-1">
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin" style={{ color: '#33907c' }} />
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Receipt size={32} style={{ color: 'var(--gv-text-faint)' }} className="mb-2" />
                <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>No invoices yet</p>
              </div>
            ) : (
              recentInvoices.map((inv, idx) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2.5 rounded-lg px-2"
                  style={{ borderBottom: idx < recentInvoices.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(51,144,124,0.12)' }}>
                      <StatusIcon status={inv.status} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--gv-text-primary)' }}>
                        {inv.invoice_number}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--gv-text-subtle)' }}>
                        {inv.supplier_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold" style={{ color: '#33907c' }}>
                      KES {inv.total_invoice_value?.toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {!invoicesLoading && (
            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
              <Link
                href="/finance/invoices/new"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(51,144,124,0.10)', color: '#33907c', border: '1px solid rgba(51,144,124,0.20)' }}
              >
                <Receipt size={14} /> Submit New Invoice
              </Link>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="gv-card overflow-hidden flex flex-col" style={{ padding: 0 }}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
          >
            <div className="flex items-center gap-2">
              <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
                <Users size={15} style={{ color: '#33907c' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--gv-text-primary)' }}>
                Recent Users
              </h3>
            </div>
            <Link href="/users/dashboard" className="flex items-center gap-1 text-xs font-medium" style={{ color: '#33907c' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex-1 px-5 py-3">
            {usersLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin" style={{ color: '#33907c' }} />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <UserCircle size={32} style={{ color: 'var(--gv-text-faint)' }} className="mb-2" />
                <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>No users yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentUsers.map((u, idx) => (
                  <div
                    key={u.ref_id}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg"
                    style={{ borderBottom: idx < recentUsers.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(51,144,124,0.20)' }}
                    >
                      <span className="text-white text-xs font-bold">
                        {u.firstName?.[0] ?? '?'}{u.lastName?.[0] ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--gv-text-primary)' }}>
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--gv-text-subtle)' }}>{u.email}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c', border: '1px solid rgba(51,144,124,0.25)' }}
                    >
                      {u.role ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-4 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
            {[
              { label: 'Add User', href: '/users/new', icon: Users },
              { label: 'Roles', href: '/users/roles', icon: BarChart2 },
              { label: 'Reports', href: '/users/reports', icon: Briefcase },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}