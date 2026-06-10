'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ApiUser } from '@/types';
import { UserPlus, Search, Trash2, Shield, X, Mail, Phone, Building2, BadgeCheck } from 'lucide-react';
import { API } from '@/lib/endpoints';

const roleColors: Record<string, string> = {
  Admin:              'bg-red-500/20 text-red-300 border border-red-500/20',
  ADMIN:              'bg-red-500/20 text-red-300 border border-red-500/20',
  FIELD_ENGINEER:     'bg-green-500/20 text-green-300 border border-green-500/20',
  AUDITOR:            'bg-orange-500/20 text-orange-300 border border-orange-500/20',
  FOREMAN:            'bg-purple-500/20 text-purple-300 border border-purple-500/20',
  FINANCE:            'bg-blue-500/20 text-blue-300 border border-blue-500/20',
  DIRECTOR:           'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20',
  DEPARTMENT_MANAGER: 'bg-teal-500/20 text-teal-300 border border-teal-500/20',
};

interface Department {
  id:   number;
  name: string;
}

interface UserDetail extends ApiUser {
  departments?: Department[];
}

export default function UsersPage() {
  const [users,         setUsers]         = useState<ApiUser[]>([]);
  const [filtered,      setFiltered]      = useState<ApiUser[]>([]);
  const [search,        setSearch]        = useState('');
  const [isLoading,     setIsLoading]     = useState(true);
  const [selected,      setSelected]      = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [visible,       setVisible]       = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(API.users.list);
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.role ?? '').toLowerCase().includes(q)
        )
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [search, users]);

  const openDetail = async (user: ApiUser) => {
    setSelected(user as UserDetail);
    setVisible(true);
    setDetailLoading(true);
    try {
      const [userRes, deptRes] = await Promise.all([
        api.get(API.users.get(user.id)),
        api.get(API.users.departments(user.id)),
      ]);
      const userDetail  = userRes.data?.data ?? userRes.data;
      const deptPayload = deptRes.data?.data ?? deptRes.data;
      const depts       = Array.isArray(deptPayload) ? deptPayload : deptPayload?.items ?? [];
      setSelected({ ...userDetail, departments: depts });
    } catch (err) {
      console.error('Failed to load user detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setSelected(null), 250);
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(API.users.delete(id));
      closeModal();
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
                <tr
                  key={user.ref_id}
                  onClick={() => openDetail(user)}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#33907C] rounded-full flex items-center justify-center shrink-0">
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
                      onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }}
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

      {/* ── Centered Modal ── */}
      {selected && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-250 ${
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Card */}
          <div
            className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-all duration-250 ${
              visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            }`}
            style={{
              background:           'var(--gv-nav-bg)',
              border:               '1px solid var(--gv-glass-border)',
              backdropFilter:       'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-7 py-5"
              style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                  style={{ background: 'var(--gv-brand)' }}
                >
                  {selected.firstName?.[0] ?? '?'}{selected.lastName?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-white font-semibold text-base leading-tight">
                    {selected.firstName} {selected.lastName}
                  </p>
                  <span className={`mt-0.5 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${roleColors[selected.role ?? ''] ?? 'bg-white/10 text-white/60'}`}>
                    {selected.role ?? '—'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-7 py-6">
              {detailLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Contact */}
                  <div className="gv-card space-y-4">
                    <p className="gv-label">Contact</p>
                    <InfoRow icon={<Mail size={14} />}  label="Email"  value={selected.email} />
                    <InfoRow icon={<Phone size={14} />} label="Phone"  value={selected.phone ?? '—'} />
                  </div>

                  {/* Account */}
                  <div className="gv-card space-y-4">
                    <p className="gv-label">Account</p>
                    <InfoRow icon={<BadgeCheck size={14} />} label="Role" value={selected.role ?? '—'} />
                    <InfoRow
                      icon={
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            selected.is_active !== false ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        />
                      }
                      label="Status"
                      value={selected.is_active !== false ? 'Active' : 'Inactive'}
                    />
                  </div>

                  {/* Departments */}
                  <div className="gv-card space-y-3">
                    <p className="gv-label flex items-center gap-1.5">
                      <Building2 size={12} />
                      Departments
                    </p>
                    {selected.departments && selected.departments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selected.departments.map((d) => (
                          <span
                            key={d.id}
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              background: 'rgba(51,144,124,0.12)',
                              border:     '1px solid rgba(51,144,124,0.28)',
                              color:      'var(--gv-brand)',
                            }}
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
                        Not assigned to any department
                      </p>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-between px-7 py-4"
              style={{ borderTop: '1px solid var(--gv-glass-border)' }}
            >
              <button
                onClick={() => deleteUser(selected.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <Trash2 size={15} />
                Delete User
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon:  React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--gv-text-subtle)' }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--gv-text-subtle)' }}>{label}</p>
        <p className="text-sm text-white break-all">{value}</p>
      </div>
    </div>
  );
}