'use client';

import { useMemo, useState } from 'react';
import { departmentDetailService } from '@/lib/api/department-detail-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { useCachedLookup } from '@/hooks/useCachedLookup';
import { API } from '@/lib/endpoints';
import { parseUsers } from '@/lib/utils/parse-entities';
import { AssignResult, User } from '@/types/department-detail';

export function useAssignUsers(deptId: number, currentUserEmails: Set<string>) {
  const { data, loading, error, refetch } = useCachedLookup<unknown>(API.users.list);

  const allUsers = useMemo<User[]>(
    () => (data ? parseUsers(data, '/users/list') : []),
    [data],
  );

  const errMsg = error
    ? 'Failed to load users'
    : (!loading && allUsers.length === 0 ? 'Users API returned 0 items.' : null);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

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
    refetch,
  };
}