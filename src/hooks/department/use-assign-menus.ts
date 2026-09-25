'use client';

import { useState, useEffect, useMemo } from 'react';
import { departmentDetailService } from '@/lib/api/departments';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';
import { AssignResult, Menu } from '@/types/department-detail';

export function useAssignMenus(deptId: number, currentMenuIds: Set<number>) {
  const [allMenus, setAllMenus] = useState<Menu[]>(
    () => readEntityCache<Menu[]>(ENTITY_CACHE_KEYS.menus) ?? [],
  );
  const [loading, setLoading] = useState<boolean>(
    () => readEntityCache<Menu[]>(ENTITY_CACHE_KEYS.menus) === null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // departmentDetailService.listAllMenus() is cache-first against the same
    // ENTITY_CACHE_KEYS.menus entry the Sections > Menus page fills — so if
    // that page (or any other menu fetch) already ran, this resolves
    // instantly from the local db instead of hitting the network again.
    departmentDetailService.listAllMenus()
      .then((menus) => {
        if (cancelled) return;
        setAllMenus(menus);
      })
      .catch((err) => {
        console.error('[useAssignMenus] load failed:', err);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const errMsg = error
    ? 'Failed to load menus'
    : (!loading && allMenus.length === 0 ? 'Menus API returned 0 items.' : null);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const available = useMemo(
    () => allMenus
      .filter((m) => !currentMenuIds.has(m.id))
      .filter((m) => (m.title || m.name).toLowerCase().includes(search.toLowerCase())),
    [allMenus, search, currentMenuIds],
  );

  const alreadyAssignedCount = useMemo(
    () => allMenus.filter((m) => currentMenuIds.has(m.id)).length,
    [allMenus, currentMenuIds],
  );

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => setSelected(new Set(available.map((m) => m.id)));
  const deselectAll = () => setSelected(new Set());

  const assign = async (): Promise<AssignResult> => {
    if (selected.size === 0) return { ok: false, message: 'No menus selected' };
    setSaving(true);
    try {
      await departmentDetailService.assignMenus(deptId, [...selected]);
      return { ok: true };
    } catch (err) {
      console.error('[useAssignMenus] assign failed:', err);
      return { ok: false, message: getApiErrorMessage(err, 'Failed to assign menus') };
    } finally {
      setSaving(false);
    }
  };

  return {
    allMenus, available, alreadyAssignedCount,
    loading, errMsg,
    search, setSearch,
    selected, toggle, selectAll, deselectAll,
    saving, assign,
  };
}