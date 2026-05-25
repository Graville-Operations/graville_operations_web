'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import {
  Users, BarChart2, Briefcase, TrendingUp,
  ArrowRight, Clock, Receipt, CheckCircle2,
  AlertCircle, Loader2, UserCircle,
} from 'lucide-react';

interface InvoiceItem {
  id: number;
  invoice_number: string;
  supplier_name: string;
  total_invoice_value: number;
  invoice_date: string;
  status?: string;
}

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

const stats = [
  {
    label: 'Total Workers',
    value: '152',
    icon: Users,
    iconBg: 'rgba(96,165,250,0.20)',
    iconColor: '#60a5fa',
    change: '+12%',
    positive: true,
  },
  {
    label: 'Active Projects',
    value: '8',
    icon: TrendingUp,
    iconBg: 'rgba(51,144,124,0.20)',
    iconColor: '#33907c',
    change: '+2',
    positive: true,
  },
  {
    label: 'Pending Invoices',
    value: '14',
    icon: Briefcase,
    iconBg: 'rgba(251,146,60,0.20)',
    iconColor: '#fb923c',
    change: '-3',
    positive: false,
  },
  {
    label: 'Monthly Spend',
    value: 'KES 2.4M',
    icon: BarChart2,
    iconBg: 'rgba(167,139,250,0.20)',
    iconColor: '#a78bfa',
    change: '+8%',
    positive: true,
  },
];

function StatusIcon({ status }: { status?: string }) {
  if (!status) return null;
  if (status === 'FULLY_PAID')
    return <CheckCircle2 size={14} style={{ color: '#33907c' }} />;
  if (status === 'REJECTED')
    return <AlertCircle size={14} style={{ color: '#f87171' }} />;
  return <Clock size={14} style={{ color: '#fb923c' }} />;
}

export default function HomePage() {
  const { user, role } = useAuthStore();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<ApiUser[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    api
      .get('/invoices/all?limit=5')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        const list = Array.isArray(payload)
          ? payload
          : payload?.items ?? payload?.results ?? [];
        setInvoices(list.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setInvoicesLoading(false));

    api
      .get('/users/list?limit=5')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        const list = Array.isArray(payload)
          ? payload
          : payload?.items ?? [];
        setRecentUsers(list.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setUsersLoading(false));
  }, []);

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(51,144,124,0.30) 0%, rgba(23,57,144,0.25) 100%)',
          border: '1px solid rgba(51,144,124,0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(51,144,124,0.18) 0%, transparent 70%)',
          }}
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
            Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="gv-card gv-stat-card p-5!">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: stat.iconBg }}>
                  <Icon size={20} style={{ color: stat.iconColor }} />
                </div>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    background: stat.positive
                      ? 'rgba(51,144,124,0.15)'
                      : 'rgba(248,113,113,0.12)',
                    color: stat.positive ? '#33907c' : '#f87171',
                    border: `1px solid ${
                      stat.positive
                        ? 'rgba(51,144,124,0.25)'
                        : 'rgba(248,113,113,0.20)'
                    }`,
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
                {stat.value}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--gv-text-muted)' }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Invoices */}
        <div className="gv-card p-0! overflow-hidden flex flex-col">
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
          >
            <div className="flex items-center gap-2">
              <div className="gv-icon-box w-8! h-8!">
                <Receipt size={15} style={{ color: '#33907c' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--gv-text-primary)' }}>
                Recent Invoices
              </h3>
            </div>
            <Link
              href="/finance/invoices"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: '#33907c' }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex-1 px-5 py-3 space-y-1">
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin" style={{ color: '#33907c' }} />
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Receipt size={32} style={{ color: 'var(--gv-text-faint)' }} className="mb-2" />
                <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
                  No invoices yet
                </p>
              </div>
            ) : (
              invoices.map((inv, idx) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2.5 rounded-lg px-2"
                  style={{
                    borderBottom:
                      idx < invoices.length - 1
                        ? '1px solid var(--gv-glass-border)'
                        : 'none',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(51,144,124,0.12)' }}
                    >
                      <StatusIcon status={inv.status} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--gv-text-primary)' }}
                      >
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
            <div
              className="px-5 py-3"
              style={{ borderTop: '1px solid var(--gv-glass-border)' }}
            >
              <Link
                href="/finance/invoices/new"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: 'rgba(51,144,124,0.10)',
                  color: '#33907c',
                  border: '1px solid rgba(51,144,124,0.20)',
                }}
              >
                <Receipt size={14} /> Submit New Invoice
              </Link>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="gv-card p-0! overflow-hidden flex flex-col">
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
          >
            <div className="flex items-center gap-2">
              <div className="gv-icon-box w-8! h-8!">
                <Users size={15} style={{ color: '#33907c' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--gv-text-primary)' }}>
                Recent Users
              </h3>
            </div>
            <Link
              href="/users/dashboard"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: '#33907c' }}
            >
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
                <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
                  No users yet
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentUsers.map((u, idx) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg"
                    style={{
                      borderBottom:
                        idx < recentUsers.length - 1
                          ? '1px solid var(--gv-glass-border)'
                          : 'none',
                    }}
                  >
                    <div className="sb-avatar shrink-0">
                      <span className="text-white text-xs font-bold">
                        {u.firstName?.[0] ?? '?'}{u.lastName?.[0] ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--gv-text-primary)' }}
                      >
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--gv-text-subtle)' }}>
                        {u.email}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: 'rgba(51,144,124,0.15)',
                        color: '#33907c',
                        border: '1px solid rgba(51,144,124,0.25)',
                      }}
                    >
                      {u.role ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div
            className="px-5 py-4 grid grid-cols-3 gap-2"
            style={{ borderTop: '1px solid var(--gv-glass-border)' }}
          >
            {[
              { label: 'Add User',   href: '/users/new',       icon: Users },
              { label: 'Roles',      href: '/users/roles',     icon: BarChart2 },
              { label: 'Assign',     href: '/users/roles/assign', icon: Briefcase },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-colors"
                style={{
                  background: 'var(--gv-glass-bg)',
                  color: 'var(--gv-text-muted)',
                  border: '1px solid var(--gv-glass-border)',
                }}
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