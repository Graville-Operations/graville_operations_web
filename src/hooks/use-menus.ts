'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { menusService, getApiErrorMessage } from '@/lib/api/menus';
import { Menu, ModalType, MenuFormData, MenuPayload } from '@/types/menu';

const emptyForm: MenuFormData = { name: '', title: '', link: '', order: '0' };

export type DeleteTarget = { type: 'menu' | 'submenu' | 'subsubmenu'; id: number } | null;

export function useMenus() {
  const { menus: cachedMenus, isLoaded, setMenus, clearMenus } = useMenuStore();

  const [menus, setLocalMenus] = useState<Menu[]>(cachedMenus as Menu[]);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchMenus = useCallback(async () => {
  try {
    setIsLoading(true);
    const list = await menusService.list();
    const normalized = list.map((m) => ({ ...m, submenus: m.submenus ?? [] }));
    setMenus(normalized);
    setLocalMenus(list); // local state can keep the original Menu[] shape with optional submenus
  } catch {
    setLocalMenus([]);
  } finally {
    setIsLoading(false);
  }
}, [setMenus]);

  useEffect(() => {
    if (isLoaded && cachedMenus.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalMenus(cachedMenus as Menu[]);
    }
  }, [isLoaded, cachedMenus]);

  const openModal = (m: ModalType, prefill?: Partial<MenuFormData>) => {
    setError('');
    setForm({ ...emptyForm, ...prefill });
    setModal(m);
  };

  const closeModal = () => {
    setModal(null);
    setError('');
  };

  const invalidateAndRefresh = async () => {
    clearMenus();
    // Every menusService mutation (createMenu/updateMenu/deleteMenu/...)
    // already clears ENTITY_CACHE_KEYS.menus itself, and every other menu
    // reader — the Assign Menu modal included — shares that same cache
    // entry, so this refetch is enough to pick up the change everywhere.
    await fetchMenus();
  };

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    setError('');
    try {
      const body: MenuPayload = {
        name: form.name,
        title: form.title,
        link: form.link || null,
        order: Number(form.order),
      };

      switch (modal.type) {
        case 'menu-create':
          await menusService.createMenu(body);
          break;
        case 'menu-edit':
          await menusService.updateMenu(modal.menu.id, body);
          break;
        case 'submenu-create':
          await menusService.createSubmenu(modal.menuId, body);
          break;
        case 'submenu-edit':
          await menusService.updateSubmenu(modal.submenu.id, body);
          break;
        case 'subsubmenu-create':
          await menusService.createSubsubmenu(modal.submenuId, body);
          break;
        case 'subsubmenu-edit':
          await menusService.updateSubsubmenu(modal.subsubmenu.id, body);
          break;
      }

      closeModal();
      await invalidateAndRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Opens the in-app confirm modal instead of the browser's native confirm().
  const requestDelete = (type: 'menu' | 'submenu' | 'subsubmenu', id: number) => {
    setDeleteError('');
    setDeleteTarget({ type, id });
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleting(true);
    setDeleteError('');
    try {
      if (type === 'menu') await menusService.deleteMenu(id);
      else if (type === 'submenu') await menusService.deleteSubmenu(id);
      else await menusService.deleteSubsubmenu(id);
      await invalidateAndRefresh();
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete'));
    } finally {
      setDeleting(false);
    }
  };

  return {
    menus,
    isLoading,
    modal,
    form,
    saving,
    error,
    setForm,
    openModal,
    closeModal,
    handleSave,
    deleteTarget,
    deleting,
    deleteError,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}