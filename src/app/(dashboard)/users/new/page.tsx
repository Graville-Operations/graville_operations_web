/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useUserStore } from '@/store/user-store';
import { API } from '@/lib/endpoints';
import { ROUTES } from '@/lib/routes';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Department {
  id: number;
  name: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const { clearUsers } = useUserStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_no: '',
    password: 'Password098!',
    role_id: '' as string | number,
    department_id: '' as string | number,
    site_ids: null as number[] | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await api.get(API.roles.list);
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setRoles(list);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments/list', { params: { skip: 0, limit: 100 } });
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setDepartments(list);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data: created } = await api.post(API.users.create, {
        first_name:    form.first_name,
        last_name:     form.last_name,
        email:         form.email,
        phone_no:      form.phone_no || null,
        password:      form.password,
        role_id:       Number(form.role_id),
        department_id: form.department_id ? Number(form.department_id) : null,
        site_ids:      form.site_ids,
      });

      // Assign to department if one was selected
      if (form.department_id) {
        const newUserId: number =
          created?.data?.id ?? created?.id ?? created?.user?.id;

        if (newUserId) {
          await api.post(`/departments/${form.department_id}/assign-users`, {
            user_ids: [newUserId],
          });
        }
      }

      clearUsers();
      router.push(ROUTES.users.dashboard);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } };
      setError(e.response?.data?.message || e.response?.data?.detail || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white [&>option]:bg-[#0d1b2a] [&>option]:text-white';

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30';

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

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'First Name', key: 'first_name', required: true },
            { label: 'Last Name',  key: 'last_name',  required: true },
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">
                {label} {required && '*'}
              </label>
              <input
                type="text"
                value={(form as Record<string, unknown>)[key] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className={inputClass}
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
            className={inputClass}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Phone Number</label>
          <input
            type="tel"
            value={form.phone_no}
            onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
            placeholder="+254700000000"
            className={inputClass}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Default Password *</label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className={inputClass}
          />
          <p className="text-xs text-white/30 mt-1">
            User will be prompted to change this on first login.
          </p>
        </div>

        {/* Role + Department Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">Role *</label>
            <select
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              required
              className={selectClass}
            >
              <option value="">Select role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className={selectClass}
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
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