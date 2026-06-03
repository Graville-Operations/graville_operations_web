'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Search, Check, Users } from 'lucide-react';
import { API } from '@/lib/endpoints';

interface Role {
  id: number;
  name: string;
}

interface ApiUser {
  id: number;       
  ref_id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export default function AssignRolePage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filtered, setFiltered] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set()); 
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRoles = async () => {
    try {
      const { data } = await api.get(API.roles.list);
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setRoles(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(API.users.list);
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoles();
    fetchUsers();
  }, []);

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

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAllSelected = filtered.length > 0 && filtered.every((u) => selectedUserIds.has(u.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  const handleAssign = async () => {
    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }
    if (selectedUserIds.size === 0) {
      setError('Please select at least one user');
      return;
    }

    setAssigning(true);
    setError('');
    setSuccess('');

    const results = await Promise.allSettled(
      Array.from(selectedUserIds).map((userId) =>
        api.post(`/roles/${selectedRoleId}/assign/${userId}`)
      )
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;

    setAssigning(false);

    if (failed === 0) {
      setSuccess(`Role assigned to ${succeeded} user${succeeded > 1 ? 's' : ''} successfully`);
      setSelectedUserIds(new Set());
      fetchUsers();
    } else {
      setError(`${succeeded} succeeded, ${failed} failed. Check permissions and try again.`);
      fetchUsers();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Assign Role</h2>
          <p className="text-sm text-blue-200/60">Select a role and assign it to one or more users</p>
        </div>
      </div>

      {/* Role selector */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg">
        <label className="block text-sm font-medium text-blue-100/80 mb-2">
          Select Role to Assign
        </label>
        <select
          value={selectedRoleId ?? ''}
          onChange={(e) => setSelectedRoleId(Number(e.target.value))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm [&>option]:bg-[#0d1b2a]"
        >
          <option value="">Select a role...</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Users list */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        {/* Search + select all bar */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
            />
          </div>

          {/* Select all row */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isAllSelected
                  ? 'bg-[#33907C] border-[#33907C]'
                  : 'border-white/30 hover:border-white/60'
              }`}>
                {isAllSelected && <Check size={12} className="text-white" />}
              </div>
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-white/40">
              {selectedUserIds.size} selected · {filtered.length} shown
            </span>
          </div>
        </div>

        {/* Users */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <Users size={40} className="mb-2 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((user) => {
              const isSelected = selectedUserIds.has(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-all ${
                    isSelected ? 'bg-[#33907C]/15' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#33907C] border-[#33907C]'
                      : 'border-white/30'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 bg-[#33907C]/30 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user.firstName?.[0] ?? '?'}{user.lastName?.[0] ?? '?'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>

                  {/* Current role */}
                  <span className="text-xs text-white/40 shrink-0">{user.role ?? '—'}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl">
          {success}
        </p>
      )}

      {/* Assign button */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleAssign}
          disabled={assigning || selectedUserIds.size === 0 || !selectedRoleId}
          className="flex-1 flex items-center justify-center gap-2 bg-[#33907C] hover:bg-[#2a7a69] text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} />
          {assigning
            ? 'Assigning...'
            : `Assign Role${selectedUserIds.size > 1 ? ` to ${selectedUserIds.size} Users` : ''}`
          }
        </button>
      </div>
    </div>
  );
}