'use client';

import { useSidebarMenus } from '@/hooks/layout/useSidebarMenus';
import { SidebarLogo } from '@/components/layout/sidebar/SidebarLogo';
import { MenuSkeleton } from '@/components/layout/sidebar/MenuSkeleton';
import { MenuTree } from '@/components/layout/sidebar/MenuTree';
import { SidebarFooter } from '@/components/layout/sidebar/SidebarFooter';

export default function Sidebar() {
  const {
    menus, isLoading, openMenus, toggleMenu,
    user, role, handleLogout,
    getMenuHref, isMenuActive, isSubActive, isSubSubActive,
  } = useSidebarMenus();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 bg-white/5 backdrop-blur-md [box-shadow:2px_0_0_rgba(255,255,255,0.06),8px_0_32px_rgba(0,0,0,0.6)]">
      <SidebarLogo />

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {isLoading ? (
          <MenuSkeleton />
        ) : (
          <MenuTree
            menus={menus}
            openMenus={openMenus}
            onToggle={toggleMenu}
            getMenuHref={getMenuHref}
            isMenuActive={isMenuActive}
            isSubActive={isSubActive}
            isSubSubActive={isSubSubActive}
          />
        )}
      </nav>

      <SidebarFooter user={user} role={role} onLogout={handleLogout} />
    </aside>
  );
}