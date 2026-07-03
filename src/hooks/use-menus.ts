'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { menusService, getApiErrorMessage } from '@/lib/api/menus-service';
import { Menu, ModalType, MenuFormData, MenuPayload } from '@/types/menu';

const emptyForm: MenuFormData = { name: '', title: '', link: '', order: '0' };

export function useMenus() {
  const { menus: cachedMenus, isLoaded, setMenus, clearMenus } = useMenuStore();

  const [menus, setLocalMenus] = useState<Menu[]>(cachedMenus as Menu[]);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await menusService.list();
      setMenus(list);
      setLocalMenus(list);
    } catch {
      setLocalMenus([]);
    } finally {
      setIsLoading(false);
    }
  }, [setMenus]);

  useEffect(() => {
    if (!isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMenus();
    }
  }, [isLoaded, fetchMenus]);

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

  const handleDelete = async (type: 'menu' | 'submenu' | 'subsubmenu', id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'menu') await menusService.deleteMenu(id);
      else if (type === 'submenu') await menusService.deleteSubmenu(id);
      else await menusService.deleteSubsubmenu(id);
      await invalidateAndRefresh();
    } catch {
      alert('Failed to delete');
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
    handleDelete,
  };
}