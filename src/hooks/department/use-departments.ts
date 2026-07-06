'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { departmentsService } from '@/lib/api/departments-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { CreateDepartmentPayload, Department, RawDepartment, ToastState } from '@/types/department';

function mapDepartment(d: RawDepartment): Department {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? '',
    menusCount: typeof d.menus === 'number' ? d.menus : 0,
    usersCount: typeof d.users === 'number' ? d.users : 0,
  };
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await departmentsService.list();

      if (raw.length === 0) {
        console.warn('[Departments] list() returned an empty array');
      }

      setDepartments(raw.map(mapDepartment));
    } catch (err) {
      console.error('[Departments] list fetch failed:', err);
      showToast(getApiErrorMessage(err, 'Failed to load departments'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

   const createDepartment = useCallback(async (payload: CreateDepartmentPayload) => {
    if (!payload.name.trim()) {
      throw new Error('Department name is required.');
    }
    try {
      await departmentsService.create(payload);
      showToast('Department created successfully!', 'success');
      await fetchDepartments();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create department.'));
    }
  }, [fetchDepartments, showToast]);

  const filtered = useMemo(
    () => departments.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()),
    ),
    [departments, search],
  );

  return {
    departments,
    filtered,
    isLoading,
    search,
    setSearch,
    toast,
    createDepartment,
  };
}