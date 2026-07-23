'use client';

import { useState, useEffect, useMemo } from 'react';
import { ApiUser } from '@/types';
import { API } from '@/lib/endpoints';
import { unwrapList } from '@/lib/api/users';
import { useCachedLookup } from '@/hooks/useCachedLookup';

export function useUsers() {
  const { data, loading: isLoading, refetch } = useCachedLookup<unknown>(API.users.list);
  const users = useMemo(() => (data ? unwrapList<ApiUser>(data) : []), [data]);

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