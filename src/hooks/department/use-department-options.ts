'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Callers (e.g. useDepartments()) typically pass an inline arrow function
  // here, so its identity changes on every render of the caller. Routing it
  // through a ref means fetchDepartments never needs onError as a
  // useCallback dependency, so it keeps a stable identity across renders —
  // that's what stops the effect below from re-firing on every render and
  // causing a "Maximum update depth exceeded" loop.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

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
      // departmentsService.list() is cache-first internally (local db, then
      // the API), via the shared ENTITY_CACHE_KEYS.departments cache.
      // setDeptCache() below is a *separate* cache — it's what the
      // department detail page (use-department-detail.ts) reads to
      // instant-paint itself before its own fetch resolves, so it has to
      // stay populated here too, not just the service-level one.
      const raw = await departmentsService.list();

      if (raw.length === 0) {
        console.warn('[useDepartmentOptions] list() returned an empty array');
      }

      const mapped = raw.map(mapDepartment);
      setDepartments(mapped);
      setDeptCache(mapped);
    } catch (err) {
      console.error('[useDepartmentOptions] fetch failed:', err);
      onErrorRef.current?.(getApiErrorMessage(err, 'Failed to load departments'));
    } finally {
      setIsLoading(false);
    }
  }, []); // stable identity — never recreated, so the effect below runs once

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