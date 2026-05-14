'use client';
import { useAuthStore } from '@/store/auth-store';
import { Users, BarChart2, Briefcase, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Workers', value: '152', icon: Users, color: 'bg-blue-500', change: '+12%' },
  { label: 'Active Projects', value: '8', icon: TrendingUp, color: 'bg-[#33907C]', change: '+2' },
  { label: 'Pending Invoices', value: '14', icon: Briefcase, color: 'bg-orange-500', change: '-3' },
  { label: 'Monthly Spend', value: 'KES 2.4M', icon: BarChart2, color: 'bg-purple-500', change: '+8%' },
];

export default function HomePage() {
  const { user, role } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">
          Hello, {user?.first_name ?? 'there'} 👋
        </h2>
        <p className="text-blue-200/70 mt-1">
          {role} — Here's what's happening today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="gv-stat-card bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-xl`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-blue-200/70 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white mb-4">Recent Invoices</h3>
          <p className="text-blue-200/50 text-sm">Loading invoices...</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white mb-4">Project Status</h3>
          <p className="text-blue-200/50 text-sm">Loading projects...</p>
        </div>
      </div>
    </div>
  );
}