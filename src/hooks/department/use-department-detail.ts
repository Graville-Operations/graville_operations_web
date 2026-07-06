'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { departmentDetailService } from '@/lib/api/department-detail-service';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { DeptDetail, Menu, User, ToastState } from '@/types/department-detail';

export function useDepartmentDetail(deptId: number) {
  const [dept, setDept] = useState<DeptDetail | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [menusLoading, setMenusLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [removingMenuId, setRemovingMenuId] = useState<number | null>(null);
  const [removingUserEmail, setRemovingUserEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadDept = useCallback(async () => {
    if (!deptId) return;
    setDeptLoading(true);
    try {
      setDept(await departmentDetailService.getDepartment(deptId));
    } catch (err) {
      console.warn('[useDepartmentDetail] loadDept failed:', err);
    } finally {
      setDeptLoading(false);
    }
  }, [deptId]);

  const loadMenus = useCallback(async () => {
    if (!deptId) return;
    setMenusLoading(true);
    try {
      setMenus(await departmentDetailService.getMenus(deptId));
    } catch (err) {
      console.warn('[useDepartmentDetail] loadMenus failed:', err);
      showToast('Failed to load menus', 'error');
    } finally {
      setMenusLoading(false);
    }
  }, [deptId, showToast]);

  const loadUsers = useCallback(async () => {
    if (!deptId) return;
    setUsersLoading(true);
    try {
      setUsers(await departmentDetailService.getMembers(deptId));
    } catch (err) {
      console.warn('[useDepartmentDetail] loadUsers failed:', err);
      showToast('Failed to load members', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [deptId, showToast]);

  const load = useCallback(() => {
    loadDept();
    loadMenus();
    loadUsers();
  }, [loadDept, loadMenus, loadUsers]);

  useEffect(() => {
    load();
  }, [load]);

  const removeMenu = useCallback(async (menu: Menu) => {
    setRemovingMenuId(menu.id);
    try {
      await departmentDetailService.removeMenu(deptId, menu.id);
      showToast(`"${menu.title || menu.name}" removed`, 'success');
    } catch (err) {
      console.error('[useDepartmentDetail] removeMenu failed:', err);
      showToast(getApiErrorMessage(err, 'Failed to remove menu'), 'error');
    } finally {
      await loadMenus();
      setRemovingMenuId(null);
    }
  }, [deptId, loadMenus, showToast]);

  const removeUser = useCallback(async (user: User) => {
    setRemovingUserEmail(user.email);
    try {
      await departmentDetailService.removeUser(deptId, user.id);
      showToast(`"${user.name}" removed`, 'success');
    } catch (err) {
      console.error('[useDepartmentDetail] removeUser failed:', err);
      showToast(getApiErrorMessage(err, 'Failed to remove user — endpoint needs confirming'), 'error');
    } finally {
      await loadUsers();
      setRemovingUserEmail(null);
    }
  }, [deptId, loadUsers, showToast]);

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