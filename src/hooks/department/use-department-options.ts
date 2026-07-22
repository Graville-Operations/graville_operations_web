'use client';

import { useState, useEffect, useCallback } from 'react';
import { departmentsService } from '@/lib/api/departments-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { getDeptCache, setDeptCache } from '@/lib/departments-cache';
import { Department, RawDepartment } from '@/types/department';

function mapDepartment(d: RawDepartment): Department {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? '',
    menusCount: typeof d.menus === 'number' ? d.menus : 0,
    usersCount: typeof d.users === 'number' ? d.users : 0,
  };
}

export function useDepartmentOptions(onError?: (message: string) => void) {
  const [departments, setDepartments] = useState<Department[]>(() => getDeptCache() ?? []);
  const [isLoading, setIsLoading] = useState(() => getDeptCache() === null);

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
        console.warn('[useDepartmentOptions] list() returned an empty array');
      }

      const mapped = raw.map(mapDepartment);
      setDepartments(mapped);
      setDeptCache(mapped);
    } catch (err) {
      console.error('[useDepartmentOptions] fetch failed:', err);
      onError?.(getApiErrorMessage(err, 'Failed to load departments'));
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    isLoading,
    refresh: (opts?: { force?: boolean }) => fetchDepartments(opts ?? { force: true }),
  };
}