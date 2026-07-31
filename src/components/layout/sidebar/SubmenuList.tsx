import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { SubMenu, SubSubMenu } from '@/types/menu';
import { SubSubmenuList } from './SubSubmenuList';

interface SubmenuListProps {
  items: SubMenu[];
  openMenus: Set<number>;
  onToggle: (id: number) => void;
  isSubActive: (sub: SubMenu) => boolean;
  isSubSubActive: (subsub: SubSubMenu) => boolean;
}

export function SubmenuList({ items, openMenus, onToggle, isSubActive, isSubSubActive }: SubmenuListProps) {
  return (
    <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
      {[...items].sort((a, b) => a.order - b.order).map((sub) => (
        <div key={sub.id}>
          {sub.subsubmenus && sub.subsubmenus.length > 0 ? (
            <div>
              <button
                onClick={() => onToggle(sub.id)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  isSubActive(sub)
                    ? 'bg-[#33907C]/20 text-[#33907C] font-medium'
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                <span className="flex-1 text-left">{sub.title}</span>
                <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 opacity-50 shrink-0 ${
                      openMenus.has(sub.id) ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openMenus.has(sub.id) && (
                <SubSubmenuList items={sub.subsubmenus} isActive={isSubSubActive} />
              )}
            </div>
          ) : (
            <Link
              href={sub.link ?? '#'}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isSubActive(sub)
                  ? 'bg-[#33907C] text-white font-medium'
                  : 'text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              {sub.title}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}