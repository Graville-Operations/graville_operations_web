'use client';

import Link from 'next/link';
import { Briefcase, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const cards = [
  { label: 'Total Budget', value: 'KES 5.0M', icon: DollarSign, color: 'bg-blue-500', href: null },
  { label: 'Total Spent', value: 'KES 3.2M', icon: TrendingUp, color: 'bg-[#33907C]', href: null },
  { label: 'Pending Invoices', value: '14', icon: Briefcase, color: 'bg-orange-500', href: '/finance/invoices' },
  { label: 'Overdue Payments', value: '3', icon: AlertCircle, color: 'bg-red-500', href: null },
];

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Finance Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of financial activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`${card.color} p-2 rounded-xl w-fit mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>{content}</Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View Invoices', href: '/finance/invoices' },
            { label: 'Expenses', href: '#' },
            { label: 'Budgets', href: '#' },
            { label: 'Reports', href: '#' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center justify-center px-4 py-3 border border-[#33907C] text-[#33907C] rounded-xl hover:bg-[#33907C] hover:text-white transition-colors text-sm font-medium"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}