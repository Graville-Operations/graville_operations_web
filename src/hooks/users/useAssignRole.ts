'use client';

import { useState, useEffect } from 'react';
import { ApiUser } from '@/types';
import { Role } from '@/types/users';
import { fetchRoles, fetchUsers, assignRoleToUser } from '@/lib/api/users';

export function useAssignRole() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filtered, setFiltered] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRoles = async () => {
    try {
      const list = await fetchRoles();
      setRoles(list);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const list = await fetchUsers();
      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoles();
    loadUsers();
  }, []);

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

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = filtered.length > 0 && filtered.every((u) => selectedUserIds.has(u.id));

  const toggleSelectAll = () => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        filtered.forEach((u) => next.delete(u.id));
      } else {
        filtered.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }
    if (selectedUserIds.size === 0) {
      setError('Please select at least one user');
      return;
    }

    setAssigning(true);
    setError('');
    setSuccess('');

    const results = await Promise.allSettled(
      Array.from(selectedUserIds).map((userId) => assignRoleToUser(selectedRoleId, userId))
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;

    setAssigning(false);

    if (failed === 0) {
      setSuccess(`Role assigned to ${succeeded} user${succeeded > 1 ? 's' : ''} successfully`);
      setSelectedUserIds(new Set());
      loadUsers();
    } else {
      setError(`${succeeded} succeeded, ${failed} failed. Check permissions and try again.`);
      loadUsers();
    }
  };

  return {
    roles, filtered, search, setSearch, selectedUserIds, toggleUser,
    isAllSelected, toggleSelectAll, selectedRoleId, setSelectedRoleId,
    isLoading, assigning, error, success, handleAssign,
  };
}