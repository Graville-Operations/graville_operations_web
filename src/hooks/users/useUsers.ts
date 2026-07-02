'use client';

import { useState, useEffect } from 'react';
import { ApiUser } from '@/types';
import { fetchUsers } from '@/lib/api/users';

export function useUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filtered, setFiltered] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const list = await fetchUsers();
      setUsers(list);
      setFiltered(list);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadUsers(); }, []);

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

  return { users, filtered, search, setSearch, isLoading, refetch: loadUsers };
}