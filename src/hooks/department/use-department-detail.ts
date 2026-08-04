'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { departmentDetailService } from '@/lib/api/department-detail-service';
import {
  getCachedDepartment, setCachedDepartment,
  getCachedMenus, setCachedMenus,
  getCachedUsers, setCachedUsers,
} from '@/lib/departments-cache';
import { DeptDetail, Menu, User, ToastState } from '@/types/department-detail';

export function useDepartmentDetail(deptId: number) {
  const [dept, setDept] = useState<DeptDetail | null>(() => {
    const cached = getCachedDepartment(deptId);
    return cached ? { id: cached.id, name: cached.name, description: cached.description } : null;
  });
  const [menus, setMenus] = useState<Menu[]>(() => getCachedMenus(deptId) ?? []);
  const [users, setUsers] = useState<User[]>(() => getCachedUsers(deptId) ?? []);

  const [deptLoading, setDeptLoading] = useState(() => getCachedDepartment(deptId) === null);
  const [menusLoading, setMenusLoading] = useState(() => getCachedMenus(deptId) === null);
  const [usersLoading, setUsersLoading] = useState(() => getCachedUsers(deptId) === null);

  const [removingMenuId, setRemovingMenuId] = useState<number | null>(null);
  const [removingUserEmail, setRemovingUserEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadDept = useCallback(async () => {
    if (!deptId) return;
    const hadCache = getCachedDepartment(deptId) !== null;
    if (!hadCache) setDeptLoading(true);
    try {
      const fresh = await departmentDetailService.getDepartment(deptId);
      setDept(fresh);

      const existing = getCachedDepartment(deptId);
      setCachedDepartment({
        id: deptId,
        name: fresh.name,
        description: fresh.description ?? existing?.description ?? '',
        menusCount: existing?.menusCount ?? 0,
        usersCount: existing?.usersCount ?? 0,
      });
    } catch (err) {
      console.warn('[useDepartmentDetail] loadDept failed:', err);
    } finally {
      setDeptLoading(false);
    }
  }, [deptId]);

  const loadMenus = useCallback(async () => {
    if (!deptId) return;
    const hadCache = getCachedMenus(deptId) !== null;
    if (!hadCache) setMenusLoading(true);
    try {
      const fresh = await departmentDetailService.getMenus(deptId);
      setMenus(fresh);
      setCachedMenus(deptId, fresh);
    } catch (err) {
      console.warn('[useDepartmentDetail] loadMenus failed:', err);
    } finally {
      setMenusLoading(false);
    }
  }, [deptId]);

  const loadUsers = useCallback(async () => {
    if (!deptId) return;
    const hadCache = getCachedUsers(deptId) !== null;
    if (!hadCache) setUsersLoading(true);
    try {
      const fresh = await departmentDetailService.getMembers(deptId);
      setUsers(fresh);
      setCachedUsers(deptId, fresh);
    } catch (err) {
      console.warn('[useDepartmentDetail] loadUsers failed:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [deptId]);

  const load = useCallback(() => {
    loadDept();
    loadMenus();
    loadUsers();
  }, [loadDept, loadMenus, loadUsers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const removeMenu = useCallback(async (menu: Menu) => {
    setRemovingMenuId(menu.id);
    try {
      await departmentDetailService.removeMenu(deptId, menu.id);
      // Optimistic update — remove locally right away instead of waiting on a refetch
      setMenus((prev) => {
        const next = prev.filter((m) => m.id !== menu.id);
        setCachedMenus(deptId, next);
        return next;
      });
    } catch (err) {
      console.error('[useDepartmentDetail] removeMenu failed:', err);
    } finally {
      setRemovingMenuId(null);
    }
    // Sync with server in the background, without blocking the UI on it
    loadMenus();
  }, [deptId, loadMenus]);

  const removeUser = useCallback(async (user: User) => {
    setRemovingUserEmail(user.email);
    try {
      await departmentDetailService.removeUser(deptId, user.id);
      // Optimistic update — remove locally right away instead of waiting on a refetch
      setUsers((prev) => {
        const next = prev.filter((u) => u.email !== user.email);
        setCachedUsers(deptId, next);
        return next;
      });
    } catch (err) {
      console.error('[useDepartmentDetail] removeUser failed:', err);
    } finally {
      setRemovingUserEmail(null);
    }
    // Sync with server in the background, without blocking the UI on it
    loadUsers();
  }, [deptId, loadUsers]);

  const assignedMenuIds = useMemo(() => new Set(menus.map((m) => m.id)), [menus]);
  const assignedUserEmails = useMemo(
    () => new Set(users.map((u) => u.email.toLowerCase()).filter(Boolean)),
    [users],
  );

  return {
    dept, menus, users,
    deptLoading, menusLoading, usersLoading,
    removingMenuId, removingUserEmail,
    toast, showToast,
    load, loadMenus, loadUsers,
    removeMenu, removeUser,
    assignedMenuIds, assignedUserEmails,
  };
}