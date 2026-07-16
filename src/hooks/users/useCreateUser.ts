'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { ROUTES } from '@/lib/routes';
import { Role, Department, NewUserFormState } from '@/types/users';
import { fetchRoles, fetchDepartments, createUser, assignUserToDepartment } from '@/lib/api/users';

const initialForm: NewUserFormState = {
  first_name:    '',
  last_name:     '',
  email:         '',
  phone_no:      '',
  role_id:       '',
  department_id: '',
  site_ids:      null,
};

export function useCreateUser() {
  const router = useRouter();
  const { clearUsers } = useUserStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<NewUserFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles().then(setRoles).catch((err) => console.error('Failed to fetch roles:', err));
    fetchDepartments().then(setDepartments).catch((err) => console.error('Failed to fetch departments:', err));
  }, []);

  const updateField = (key: keyof NewUserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { id: newUserId } = await createUser(form);

      if (form.department_id && newUserId) {
        await assignUserToDepartment(form.department_id, [newUserId]);
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

  return { roles, departments, form, updateField, handleSubmit, isLoading, error };
}