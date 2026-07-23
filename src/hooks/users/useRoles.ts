'use client';

import { useState, useMemo } from 'react';
import { Role, RoleFormState } from '@/types/users';
import { API } from '@/lib/endpoints';
import { unwrapList } from '@/lib/api/users';
import { createRole, updateRole, deleteRole } from '@/lib/api/users';
import { useCachedLookup } from '@/hooks/useCachedLookup';

const emptyForm: RoleFormState = { name: '', description: '' };

export function useRoles() {
  const { data, loading: isLoading, refetch } = useCachedLookup<unknown>(API.roles.list);
  const roles = useMemo(() => (data ? unwrapList<Role>(data) : []), [data]);

  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => {
    setFormData(emptyForm);
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
    setFormData(emptyForm);
    setError('');
  };

  const updateField = (key: keyof RoleFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
      } else {
        await createRole(formData);
      }
      refetch(); 
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
      await deleteRole(id);
      refetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? 'Failed to delete role');
    }
  };

  return {
    roles, isLoading, showCreate, editingRole, formData, saving, error,
    openCreate, openEdit, closeModal, updateField, handleSave, handleDelete, refetch,
  };
}