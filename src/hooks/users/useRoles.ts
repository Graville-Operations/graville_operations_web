'use client';

import { useState, useCallback, useEffect } from 'react';
import { Role, RoleFormState } from '@/types/users';
import { fetchRoles, getCachedRoles, createRole, updateRole, deleteRole } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/api-error';

const emptyForm: RoleFormState = { name: '', description: '' };

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>(() => getCachedRoles() ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(() => getCachedRoles() === null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force ?? false;

    if (!force) {
      const cached = getCachedRoles();
      if (cached) {
        setRoles(cached);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchRoles(force);
      setRoles(data);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load roles.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

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
      await load({ force: true });
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
      await load({ force: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? 'Failed to delete role');
    }
  };

  return {
    roles, isLoading, loadError, showCreate, editingRole, formData, saving, error,
    openCreate, openEdit, closeModal, updateField, handleSave, handleDelete,
    refetch: () => load({ force: true }),
  };
}