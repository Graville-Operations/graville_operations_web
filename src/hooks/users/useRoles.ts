'use client';

import { useState, useEffect } from 'react';
import { Role, RoleFormState } from '@/types/users';
import { fetchRoles, createRole, updateRole, deleteRole } from '@/lib/api/users';

const emptyForm: RoleFormState = { name: '', description: '' };

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const list = await fetchRoles();
      setRoles(list);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadRoles(); }, []);

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
      await loadRoles();
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
      await loadRoles();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? 'Failed to delete role');
    }
  };

  return {
    roles, isLoading, showCreate, editingRole, formData, saving, error,
    openCreate, openEdit, closeModal, updateField, handleSave, handleDelete,
  };
}