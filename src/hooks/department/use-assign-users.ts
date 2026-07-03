'use client';

import { useState, useEffect, useMemo } from 'react';
import { departmentDetailService } from '@/lib/api/department-detail-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { AssignResult, User } from '@/types/department-detail';

export function useAssignUsers(deptId: number, currentUserEmails: Set<string>) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    departmentDetailService.listAllUsers()
      .then((parsed) => {
        if (cancelled) return;
        if (parsed.length === 0) setErrMsg('Users API returned 0 items.');
        setAllUsers(parsed);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[useAssignUsers] listAllUsers failed:', err);
        setErrMsg(getApiErrorMessage(err, 'Failed to load users'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const available = useMemo(
    () => allUsers
      .filter((u) => !currentUserEmails.has(u.email.toLowerCase()))
      .filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())),
    [allUsers, search, currentUserEmails],
  );

  const alreadyAssignedCount = useMemo(
    () => allUsers.filter((u) => currentUserEmails.has(u.email.toLowerCase())).length,
    [allUsers, currentUserEmails],
  );

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => setSelected(new Set(available.map((u) => u.id)));
  const deselectAll = () => setSelected(new Set());

  const assign = async (): Promise<AssignResult> => {
    if (selected.size === 0) return { ok: false, message: 'No users selected' };
    setSaving(true);
    try {
      await departmentDetailService.assignUsers(deptId, [...selected]);
      return { ok: true };
    } catch (err) {
      console.error('[useAssignUsers] assign failed:', err);
      return { ok: false, message: getApiErrorMessage(err, 'Failed to assign users') };
    } finally {
      setSaving(false);
    }
  };

  return {
    allUsers, available, alreadyAssignedCount,
    loading, errMsg,
    search, setSearch,
    selected, toggle, selectAll, deselectAll,
    saving, assign,
  };
}