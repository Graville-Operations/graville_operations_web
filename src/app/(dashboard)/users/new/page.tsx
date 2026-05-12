'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'FOREMAN', label: 'Foreman' },
  { value: 'FINANCE', label: 'Finance Department' },
];

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone_no: '', national_id: '', staff_id: '',
    account_type: '', password: 'Password098',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/refactor/create-member', form);
      router.push('/users/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Add New User</h2>
        <p className="text-sm text-blue-200/60">Create a new account for a team member</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Role *</label>
          <select
            value={form.account_type}
            onChange={(e) => setForm({ ...form, account_type: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white [&>option]:bg-[#0d1b2a] [&>option]:text-white"
          >
            <option value="">Select role...</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'First Name', key: 'first_name', required: true },
            { label: 'Last Name', key: 'last_name', required: true },
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">{label} {required && '*'}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
              />
            </div>
          ))}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="user@graville.com"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
          />
        </div>

        {/* Phone & National ID */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Phone Number', key: 'phone_no', type: 'tel' },
            { label: 'National ID', key: 'national_id', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
              />
            </div>
          ))}
        </div>

        {/* Staff ID */}
        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Staff ID</label>
          <input
            type="text"
            value={form.staff_id}
            onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
            placeholder="GRV-001"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#33907C] text-white px-4 py-3 rounded-lg hover:bg-[#2a7a69] transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}