'use client';

import { useState, useMemo } from 'react';
import { departmentDetailService } from '@/lib/api/department-detail-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { useCachedLookup } from '@/hooks/useCachedLookup';
import { API } from '@/lib/endpoints';
import { parseMenus } from '@/lib/utils/parse-entities';
import { AssignResult, Menu } from '@/types/department-detail';

export function useAssignMenus(deptId: number, currentMenuIds: Set<number>) {
  const { data, loading, error } = useCachedLookup<unknown>(API.menus.list);

  const allMenus = useMemo<Menu[]>(
    () => (data ? parseMenus(data) : []),
    [data],
  );

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