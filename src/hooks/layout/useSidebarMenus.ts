'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useMenuStore } from '@/store/menu-store';
import { ROUTES } from '@/lib/routes';
import { MenuItem, SubMenu, SubSubMenu } from '@/types/menu';
import { fetchSidebarMenus } from '@/lib/api/menu';

function linkMatches(pathname: string, href?: string | null): boolean {
  if (!href || href === '#') return false;
  return pathname === href || pathname.startsWith(href + '/');
}

type BestMatch =
  | { level: 'menu'; menuId: number; subId: null; subsubId: null; href: string }
  | { level: 'sub'; menuId: number; subId: number; subsubId: null; href: string }
  | { level: 'subsub'; menuId: number; subId: number; subsubId: number; href: string };

/**
 * Finds the single most specific (longest-link) match for the current pathname
 * across the whole menu tree, so only one item is ever highlighted as active —
 * even if a shorter sibling link happens to be a prefix of a deeper route.
 */
function findBestMatch(menus: MenuItem[], pathname: string): BestMatch | null {
  let best: BestMatch | null = null;

  const consider = (candidate: BestMatch) => {
    if (!best || candidate.href.length > best.href.length) best = candidate;
  };

  for (const menu of menus) {
    if ((!menu.submenus || menu.submenus.length === 0) && linkMatches(pathname, menu.link)) {
      consider({ level: 'menu', menuId: menu.id, subId: null, subsubId: null, href: menu.link! });
    }
    for (const sub of menu.submenus ?? []) {
      if ((!sub.subsubmenus || sub.subsubmenus.length === 0) && linkMatches(pathname, sub.link)) {
        consider({ level: 'sub', menuId: menu.id, subId: sub.id, subsubId: null, href: sub.link! });
      }
      for (const subsub of sub.subsubmenus ?? []) {
        if (linkMatches(pathname, subsub.link)) {
          consider({ level: 'subsub', menuId: menu.id, subId: sub.id, subsubId: subsub.id, href: subsub.link! });
        }
      }
    }
  }

  return best;
}

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

  const bestMatch = useMemo(() => findBestMatch(menus, pathname), [menus, pathname]);
  
  useEffect(() => {
    if (!bestMatch) return;
    setOpenMenus((prev) => {
      const next = new Set(prev);
      next.add(bestMatch.menuId);
      if (bestMatch.subId != null) next.add(bestMatch.subId);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestMatch]);

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

  const isMenuActive = (menu: MenuItem): boolean =>
    bestMatch !== null && bestMatch.menuId === menu.id;

  const isSubActive = (sub: SubMenu): boolean =>
    bestMatch !== null && bestMatch.subId === sub.id;

  const isSubSubActive = (subsub: SubSubMenu): boolean =>
    bestMatch !== null && bestMatch.level === 'subsub' && bestMatch.subsubId === subsub.id;

  return {
    menus, isLoading, openMenus, toggleMenu,
    user, role, handleLogout,
    getMenuHref, isMenuActive, isSubActive, isSubSubActive,
  };
}