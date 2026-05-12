'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { MenuItem } from '@/types';
import {
  ChevronDown, LogOut, User, Bell, Menu, X
} from 'lucide-react';


export default function TopNav() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdown(null);
  }, [pathname]);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/menu/me/menus');
      const seen = new Set<string>();
      const unique = (data as MenuItem[]).filter((m) => {
        if (seen.has(m.name)) return false;
        seen.add(m.name);
        return true;
      });
      setMenus(unique);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getMenuHref = (menu: MenuItem): string => {
    const routeMap: Record<string, string> = {
      home: '/home',
      workers: '/workers',
      inventory: '/store',
      account: '/account',
      users: '/users',
      finance: '/finance',
      admin: '/admin',
      projects: '/projects',
      departments: '/departments',
    };
    return routeMap[menu.name] ?? menu.link ?? '#';
  };

  const getSubMenuHref = (sub: { link?: string; name: string }): string => {
    return sub.link ?? '#';
  };

  const isActive = (menu: MenuItem): boolean => {
    const href = getMenuHref(menu);
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div>
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16 gap-8">

            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-[#33907C] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-white text-sm hidden sm:block">
                Graville Ops
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {isLoading ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => menu.sub_menus.length > 0 && setActiveDropdown(menu.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {menu.sub_menus.length > 0 ? (
                      <>
                        <button
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive(menu)
                              ? 'bg-[#33907C] text-white'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          
                          <span>{menu.title}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              activeDropdown === menu.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {activeDropdown === menu.id && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-[#0d1b2a]/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 py-1 z-50">
                            {menu.sub_menus
                              .sort((a, b) => a.priority - b.priority)
                              .map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={getSubMenuHref(sub)}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#33907C] opacity-60" />
                                  {sub.title}
                                </Link>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={getMenuHref(menu)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive(menu)
                            ? 'bg-[#33907C] text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >

                        <span>{menu.title}</span>
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Notification bell */}
              <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Bell size={18} className="text-white/70" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Dropdown - hover based */}
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 bg-[#33907C] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-none">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">{role}</p>
                  </div>
                  <ChevronDown size={14} className="text-white/50 hidden sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[#0d1b2a]/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 py-1 z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">{user?.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/20 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
            {menus.map((menu) => (
              <div key={menu.id}>
                {menu.sub_menus.length > 0 ? (
                  <div>
                    <button
                      onClick={() =>
                        setMobileDropdown(mobileDropdown === menu.id ? null : menu.id)
                      }
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(menu)
                          ? 'bg-[#33907C] text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{menu.title}</span>
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          mobileDropdown === menu.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {mobileDropdown === menu.id && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#33907C]/30 pl-4">
                        {menu.sub_menus
                          .sort((a, b) => a.priority - b.priority)
                          .map((sub) => (
                            <Link
                              key={sub.id}
                              href={getSubMenuHref(sub)}
                              className="block px-4 py-2.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={getMenuHref(menu)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(menu)
                        ? 'bg-[#33907C] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{menu.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}