'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { departmentDetailService } from '@/lib/api/departments';
import { fetchUsers } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ENTITY_CACHE_KEYS, readEntityCache, clearEntityCache } from '@/lib/api/cache';
import { ApiUser } from '@/types/users';
import { AssignResult, User } from '@/types/department-detail';

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
    email: u.email,
    role: u.role ?? '',
  };
}

function readCachedUsers(): User[] | null {
  const cached = readEntityCache<ApiUser[]>(ENTITY_CACHE_KEYS.users);
  return cached ? cached.map(toUser) : null;
}

export function useAssignUsers(deptId: number, currentUserEmails: Set<string>) {
  const [allUsers, setAllUsers] = useState<User[]>(() => readCachedUsers() ?? []);
  const [loading, setLoading] = useState<boolean>(() => readCachedUsers() === null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    // fetchUsers() is cache-first against the same ENTITY_CACHE_KEYS.users
    // entry the Users dashboard fills — so if that page already ran, this
    // resolves instantly from the local db instead of refetching.
    return fetchUsers()
      .then((users) => {
        setAllUsers(users.map(toUser));
      })
      .catch((err) => {
        console.error('[useAssignUsers] load failed:', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => {
    clearEntityCache(ENTITY_CACHE_KEYS.users);
    setLoading(true);
    load();
  }, [load]);

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