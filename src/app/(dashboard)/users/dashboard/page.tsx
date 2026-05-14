'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { UserPlus, Search, Trash2, Shield } from 'lucide-react';

// API response shape
interface ApiUser {
  ref_id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  nationalId?: string;
  accountStatus?: string;
  role?: string;
}

const roleColors: Record<string, string> = {
  Admin:          'bg-red-500/20 text-red-300 border border-red-500/20',
  ADMIN:          'bg-red-500/20 text-red-300 border border-red-500/20',
  FIELD_ENGINEER: 'bg-green-500/20 text-green-300 border border-green-500/20',
  AUDITOR:        'bg-orange-500/20 text-orange-300 border border-orange-500/20',
  FOREMAN:        'bg-purple-500/20 text-purple-300 border border-purple-500/20',
  FINANCE:        'bg-blue-500/20 text-blue-300 border border-blue-500/20',
};

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filtered, setFiltered] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.role ?? '').toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/users/list');
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setUsers(list);
      setFiltered(list);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (ref_id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${ref_id}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Users</h2>
          <p className="text-sm text-blue-200/60">{filtered.length} users found</p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-2 bg-[#33907C] text-white px-4 py-2 rounded-xl hover:bg-[#2a7a69] transition-colors text-sm font-medium"
        >
          <UserPlus size={16} />
          Add New User
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/40">
            <Shield size={48} className="mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['Name', 'Email', 'Role', 'Phone', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((user) => (
                <tr key={user.ref_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#33907C] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user.firstName?.[0] ?? '?'}{user.lastName?.[0] ?? '?'}
                        </span>
                      </div>
                      <span className="font-medium text-white text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleColors[user.role ?? ''] ?? 'bg-white/10 text-white/60'}`}>
                      {user.role ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{user.phone ?? '—'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteUser(user.ref_id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}