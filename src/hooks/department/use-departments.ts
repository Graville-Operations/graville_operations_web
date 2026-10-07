'use client';

import { useState, useCallback, useMemo } from 'react';
import { departmentsService } from '@/lib/api/departments';
import { getApiErrorMessage } from '@/lib/api/api-error';
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
      await departmentsService.create(payload); // busts the ENTITY_CACHE_KEYS.departments cache itself
      showToast('Department created successfully!', 'success');
      refresh({ force: true }); // not awaited — modal closes immediately, list refetches in the background
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create department.'));
    }
  }, [refresh, showToast]);

  const updateDepartment = useCallback(async (id: number, payload: CreateDepartmentPayload) => {
    if (!payload.name.trim()) {
      throw new Error('Department name is required.');
    }
    try {
      await departmentsService.update(id, payload);
      showToast('Department updated successfully!', 'success');
      refresh({ force: true });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to update department.'));
    }
  }, [refresh, showToast]);

  const requestDeleteDepartment = useCallback(async (id: number, reason: string) => {
    if (reason.trim().length < 10) {
      throw new Error('Please give a reason of at least 10 characters.');
    }
    try {
      await departmentsService.requestDeletion(id, reason);
      showToast('Deletion request submitted for approval.', 'success');
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to submit deletion request.'));
    }
  }, [showToast]);

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
    updateDepartment,
    requestDeleteDepartment,
    refresh: () => refresh({ force: true }),
  };
}