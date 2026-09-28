'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiUser } from '@/types/users';
import { fetchUsers } from '@/lib/api/users';
import { ENTITY_CACHE_KEYS, readEntityCache, clearEntityCache } from '@/lib/api/cache';

export function useUsers() {
  // fetchUsers() is cache-first against the shared ENTITY_CACHE_KEYS.users
  // entry — the same one the Assign Users modal, roles assignment, and
  // permits screens read.
  const [users, setUsers] = useState<ApiUser[]>(
    () => readEntityCache<ApiUser[]>(ENTITY_CACHE_KEYS.users) ?? [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    () => readEntityCache<ApiUser[]>(ENTITY_CACHE_KEYS.users) === null,
  );

  const load = useCallback(() => {
    setIsLoading(true);
    return fetchUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => {
    clearEntityCache(ENTITY_CACHE_KEYS.users);
    return load();
  }, [load]);

  const [filtered, setFiltered] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');


  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFiltered(users); }, [users]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.role ?? '').toLowerCase().includes(q)
        )
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [search, users]);

  return { users, filtered, search, setSearch, isLoading, refetch };
}