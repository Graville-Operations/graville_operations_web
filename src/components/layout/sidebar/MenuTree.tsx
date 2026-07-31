import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem, SubMenu, SubSubMenu } from '@/types/menu';
import { SubmenuList } from './SubmenuList';

interface MenuTreeProps {
  menus: MenuItem[];
  openMenus: Set<number>;
  onToggle: (id: number) => void;
  getMenuHref: (menu: MenuItem) => string;
  isMenuActive: (menu: MenuItem) => boolean;
  isSubActive: (sub: SubMenu) => boolean;
  isSubSubActive: (subsub: SubSubMenu) => boolean;
}

export function MenuTree({ menus, openMenus, onToggle, getMenuHref, isMenuActive, isSubActive, isSubSubActive }: MenuTreeProps) {
  return (
    <>
      {menus.map((menu) => (
        <div key={menu.id}>
          {menu.submenus && menu.submenus.length > 0 ? (
            <>
              <button
                onClick={() => onToggle(menu.id)}
                className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isMenuActive(menu)
                    ? 'bg-[#33907C]/20 text-[#33907C]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex-1 text-left">{menu.title}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 shrink-0 ${
                    openMenus.has(menu.id) ? 'rotate-180' : ''
                  } ${isMenuActive(menu) ? 'text-[#33907C]' : 'text-white/40 group-hover:text-white/60'}`}
                />
              </button>

              {openMenus.has(menu.id) && (
                <SubmenuList
                  items={menu.submenus}
                  openMenus={openMenus}
                  onToggle={onToggle}
                  isSubActive={isSubActive}
                  isSubSubActive={isSubSubActive}
                />
              )}
            </>
          ) : (
            <Link
              href={getMenuHref(menu)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isMenuActive(menu)
                  ? 'bg-[#33907C] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ChevronRight size={14} className="shrink-0 opacity-40" />
              <span className="flex-1">{menu.title}</span>
            </Link>
          )}
        </div>
      ))}
    </>
  );
}