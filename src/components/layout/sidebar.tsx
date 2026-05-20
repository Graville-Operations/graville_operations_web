'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { MenuItem } from '@/types';
import { ChevronDown, ChevronRight, LogOut, User, Bell } from 'lucide-react';

export default function Sidebar() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState<Set<number>>(new Set());
  const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/menus/list');
      const menuData = data?.data ?? data;

      if (!Array.isArray(menuData)) {
        setMenus([]);
        return;
      }

      const seen = new Set<string>();
      const unique = menuData.filter((m: MenuItem) => {
        if (seen.has(m.name)) return false;
        seen.add(m.name);
        return true;
      });
      setMenus(unique);

      // Auto-open only menus where a submenu has a real link matching current path
      unique.forEach((menu: MenuItem) => {
        if (menu.submenus?.some((sub) => sub.link && pathname.startsWith(sub.link))) {
          setOpenMenus((prev) => new Set(prev).add(menu.id));
        }
      });
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = (id: number) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  const getMenuHref = (menu: MenuItem): string => {
    const routeMap: Record<string, string> = {
      home:       '/home',
      workers:    '/workers',
      inventory:  '/store',
      account:    '/account',
      users:      '/users',
      finance:    '/finance',
      admin:      '/admin',
      projects:   '/projects',
      department: '/department/menus',
    };
    return routeMap[menu.name] ?? menu.link ?? '#';
  };

  const getSubMenuHref = (sub: { link?: string; name: string }): string => {
    const subRouteMap: Record<string, string> = {
      'users.dashboard':            '/users/dashboard',
      'users.add-user':             '/users/new',
      'users.roles-and-permission': '/users/roles',
      'users.reports':              '/users/reports',
      'users.imports':              '/users/import',
      'finance.dashboard':          '/finance',
      'finance.invoices':           '/finance/invoices',
      'finance.expenses':           '/finance/expenses',
      'projects.dashboard':         '/projects',
      'projects.new-project':       '/projects/new',
      'department.menus':           '/department/menus',
      'department.groups':          '/department/groups',
      'department.users':           '/department/users',
      // add more as you build pages...
    };
    return subRouteMap[sub.name] ?? sub.link ?? '#';
  };

  const isMenuActive = (menu: MenuItem): boolean => {
    const href = getMenuHref(menu);
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isSubActive = (sub: { link?: string; name: string }): boolean => {
    const href = getSubMenuHref(sub);
    return href !== '#' && (pathname === href || pathname.startsWith(href + '/'));
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 bg-white/5 backdrop-blur-md border-r border-white/10">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#33907C] rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base">G</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">Graville Ops</p>
            <p className="text-xs text-white/40">Management System</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          menus.map((menu) => (
            <div
              key={menu.id}
              onMouseEnter={() => setHoveredMenu(menu.id)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              {menu.submenus && menu.submenus.length > 0 ? (
                <>
                  {/* Parent with submenus */}
                  <button
                    onClick={() => toggleMenu(menu.id)}
                    className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.01] ${
                      isMenuActive(menu)
                        ? 'bg-[#33907C]/20 text-[#33907C]'
                        : 'text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span className="flex-1 text-left">{menu.title}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 shrink-0 ${
                        openMenus.has(menu.id) ? 'rotate-180' : ''
                      } ${isMenuActive(menu) ? 'text-[#33907C]' : 'text-white/40 group-hover:text-white/70'}`}
                    />
                  </button>

                  {/* Submenus — show on hover OR when toggled open */}
                  {(openMenus.has(menu.id) || hoveredMenu === menu.id) && (
                    <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
                      {menu.submenus
                        .sort((a, b) => a.order - b.order)
                        .map((sub) => (
                          <Link
                            key={sub.id}
                            href={getSubMenuHref(sub)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 hover:scale-[1.01] ${
                              isSubActive(sub)
                                ? 'bg-[#33907C] text-white font-medium'
                                : 'text-white/50 hover:bg-white/20 hover:text-white'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                            {sub.title}
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                /* Single link — no submenus */
                <Link
                  href={getMenuHref(menu)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.01] ${
                    isMenuActive(menu)
                      ? 'bg-[#33907C] text-white'
                      : 'text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <ChevronRight size={14} className="shrink-0 opacity-40" />
                  <span className="flex-1">{menu.title}</span>
                </Link>
              )}
            </div>
          ))
        )}
      </nav>

      {/* Notification + User + Logout */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {/* Notifications */}
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/20 hover:text-white hover:scale-[1.01] transition-all duration-150">
          <div className="relative">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <span>Notifications</span>
        </button>

        {/* Profile */}
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/20 hover:text-white hover:scale-[1.01] transition-all duration-150"
        >
          <div className="w-7 h-7 bg-[#33907C] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-white/40 truncate">{role}</p>
          </div>
          <User size={14} className="shrink-0 opacity-40" />
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:scale-[1.01] transition-all duration-150"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}