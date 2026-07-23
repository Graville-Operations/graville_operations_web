'use client';

import { useState, useCallback, useMemo } from 'react';
import { departmentsService } from '@/lib/api/departments-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { bustDeptCache } from '@/lib/departments-cache';
import { useDepartmentOptions } from '@/hooks/department/use-department-options';
import { CreateDepartmentPayload, ToastState } from '@/types/department';

export function useDepartments() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const { departments, isLoading, refresh } = useDepartmentOptions(
    (message) => showToast(message, 'error'),
  );

  const [search, setSearch] = useState('');

  const createDepartment = useCallback(async (payload: CreateDepartmentPayload) => {
    if (!payload.name.trim()) {
      throw new Error('Department name is required.');
    }
    try {
      await departmentsService.create(payload);
      showToast('Department created successfully!', 'success');
      bustDeptCache();
      refresh({ force: true }); // not awaited — modal closes immediately, list refetches in the background
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create department.'));
    }
  }, [refresh, showToast]);

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
    refresh: () => refresh({ force: true }),
  };
}