'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useMenuStore } from '@/store/menu-store';
import { ROUTES } from '@/lib/routes';
import { MenuItem } from '@/types/menu';
import { fetchSidebarMenus } from '@/lib/api/menu';

export function useSidebarMenus() {
  const { menus, isLoaded, setMenus, clearMenus } = useMenuStore();
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [openMenus, setOpenMenus] = useState<Set<number>>(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const loadMenus = async () => {
    if (isLoaded) return;
    try {
      setIsLoading(true);
      const list = await fetchSidebarMenus();
      setMenus(list);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMenu = (id: number) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleLogout = () => {
    clearMenus();
    logout();
    router.push(ROUTES.signin);
  };

  const getMenuHref = (menu: MenuItem): string => {
    const routeMap: Record<string, string> = {};
    return menu.link ?? routeMap[menu.name] ?? '#';
  };

  const isMenuActive = (menu: MenuItem): boolean => {
    const href = getMenuHref(menu);
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isSubActive = (sub: { link?: string | null }): boolean => {
    const href = sub.link ?? '#';
    return href !== '#' && (pathname === href || pathname.startsWith(href + '/'));
  };

  const isSubSubActive = (subsub: { link?: string | null }): boolean => {
    const href = subsub.link ?? '#';
    return href !== '#' && (pathname === href || pathname.startsWith(href + '/'));
  };

  return {
    menus, isLoading, openMenus, toggleMenu,
    user, role, handleLogout,
    getMenuHref, isMenuActive, isSubActive, isSubSubActive,
  };
}