'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { ROUTES } from '@/lib/routes';
import { useDepartmentOptions } from '@/hooks/department/use-department-options';
import { Role, NewUserFormState } from '@/types/users';
import { DEFAULT_NEW_USER_PASSWORD } from '@/lib/users-constants';
import { fetchRoles, createUser, assignUserToDepartment } from '@/lib/api/users';
import { useEffect } from 'react';

const initialForm: NewUserFormState = {
  first_name:    '',
  last_name:     '',
  email:         '',
  phone_no:      '',
  password:      DEFAULT_NEW_USER_PASSWORD,
  role_id:       '',
  department_id: '',
  site_ids:      null,
};

export function useCreateUser() {
  const router = useRouter();
  const { clearUsers } = useUserStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const { departments, isLoading: departmentsLoading } = useDepartmentOptions();
  const [form, setForm] = useState<NewUserFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles().then(setRoles).catch((err) => console.error('Failed to fetch roles:', err));
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

  return { roles, departments, departmentsLoading, form, updateField, handleSubmit, isLoading, error };
}