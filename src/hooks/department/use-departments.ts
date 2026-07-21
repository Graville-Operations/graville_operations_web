'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { departmentsService } from '@/lib/api/departments-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { getDeptCache, setDeptCache, bustDeptCache } from '@/lib/departments-cache';
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
  const [departments, setDepartments] = useState<Department[]>(() => getDeptCache() ?? []);
  const [isLoading, setIsLoading] = useState(() => getDeptCache() === null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchDepartments = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force ?? false;

    if (!force) {
      const cached = getDeptCache();
      if (cached) {
        setDepartments(cached);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      const raw = await departmentsService.list();

      if (raw.length === 0) {
        console.warn('[Departments] list() returned an empty array');
      }

      const mapped = raw.map(mapDepartment);
      setDepartments(mapped);
      setDeptCache(mapped);
    } catch (err) {
      console.error('[Departments] list fetch failed:', err);
      showToast(getApiErrorMessage(err, 'Failed to load departments'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartments();
  }, [fetchDepartments]);

  const createDepartment = useCallback(async (payload: CreateDepartmentPayload) => {
    if (!payload.name.trim()) {
      throw new Error('Department name is required.');
    }
    try {
      await departmentsService.create(payload);
      showToast('Department created successfully!', 'success');
      bustDeptCache();
      fetchDepartments({ force: true }); // not awaited — modal closes immediately, list refetches in the background
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
    refresh: () => fetchDepartments({ force: true }),
  };
}