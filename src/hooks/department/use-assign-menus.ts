'use client';

import { useState, useEffect, useMemo } from 'react';
import { departmentDetailService } from '@/lib/api/department-detail-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { AssignResult, Menu } from '@/types/department-detail';

export function useAssignMenus(deptId: number, currentMenuIds: Set<number>) {
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    departmentDetailService.listAllMenus()
      .then((parsed) => {
        if (cancelled) return;
        if (parsed.length === 0) setErrMsg('Menus API returned 0 items.');
        setAllMenus(parsed);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[useAssignMenus] listAllMenus failed:', err);
        setErrMsg(getApiErrorMessage(err, 'Failed to load menus'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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