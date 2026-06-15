'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Shield, Plus, Pencil, Trash2, X, Check, UserCog } from 'lucide-react';
import { API } from '@/lib/endpoints';
import { formatDate } from '@/lib/utils/date';

interface Role {
  id:          number;
  name:        string;
  description: string;
  created_at?: string;
  createdAt?:  string;
}

/* ── Shimmer ── */
const ShimmerStyle = () => (
  <style>{`
    @keyframes gv-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .gv-bone {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.12) 50%,
        rgba(255,255,255,0.05) 75%
      );
      background-size: 600px 100%;
      animation: gv-shimmer 1.6s infinite linear;
      border-radius: 0.375rem;
    }
  `}</style>
);

const Bone = ({ w = '100%', h = '0.85rem', style = {} }: {
  w?: string; h?: string; style?: React.CSSProperties;
}) => (
  <div className="gv-bone" style={{ width: w, height: h, flexShrink: 0, ...style }} />
);

const RoleCardSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="gv-bone shrink-0" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem' }} />
        <div className="space-y-2">
          <Bone w="8rem" h="0.875rem" />
          <Bone w="5.5rem" h="0.75rem" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="gv-bone" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem' }} />
        <div className="gv-bone" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem' }} />
      </div>
    </div>
    <div className="space-y-2 pt-1">
      <Bone w="95%" h="0.8rem" />
      <Bone w="70%" h="0.8rem" />
    </div>
  </div>
);

export default function RolesPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  const [roles,       setRoles]       = useState<Role[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData,    setFormData]    = useState({ name: '', description: '' });
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(API.roles.list);
      const payload  = data?.data ?? data;
      const list     = Array.isArray(payload) ? payload : payload?.items ?? [];
      setRoles(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => {
    setFormData({ name: '', description: '' });
    setError('');
    setEditingRole(null);
    setShowCreate(true);
  };

  const openEdit = (role: Role) => {
    setFormData({ name: role.name, description: role.description });
    setError('');
    setEditingRole(role);
    setShowCreate(true);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingRole) {
        await api.patch(API.roles.update(editingRole.id), formData);
      } else {
        await api.post(API.roles.create, formData);
      }
      await fetchRoles();
      closeModal();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(API.roles.delete(id));
      await fetchRoles();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? 'Failed to delete role');
    }
  };

  return (
    <>
      <ShimmerStyle />

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Roles & Permissions</h2>
            <p className="text-sm text-blue-200/60">Manage user roles and access levels</p>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-2">
            {/* Assign Role — navigates to assign page */}
            <Link
              href="/users/roles/assign"
              className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              <UserCog size={16} />
              Assign Role
            </Link>

            {/* New Role — opens create modal */}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#33907C] text-white px-4 py-2 rounded-xl hover:bg-[#2a7a69] transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Role
            </button>
          </div>
        </div>

        {/* Roles grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <RoleCardSkeleton key={i} />)}
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-white/40">
            <Shield size={48} className="mb-3 opacity-30" />
            <p>No roles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#33907C]/20 rounded-xl flex items-center justify-center shrink-0">
                      <Shield size={18} className="text-[#33907C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{role.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {formatDate(role.created_at ?? role.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(role)}
                      className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-1.5 text-red-400/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  {role.description || '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0d1b2a] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">
                  {editingRole ? 'Edit Role' : 'Create Role'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100/80 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Site Manager"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100/80 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this role can do..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#33907C] hover:bg-[#2a7a69] text-white transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Check size={15} />
                    {saving ? 'Saving...' : editingRole ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}