import Link from 'next/link';
import { SubSubMenu } from '@/types/menu';

interface SubSubmenuListProps {
  items: SubSubMenu[];
  isActive: (item: SubSubMenu) => boolean;
}

export function SubSubmenuList({ items, isActive }: SubSubmenuListProps) {
  return (
    <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
      {[...items].sort((a, b) => a.order - b.order).map((subsub) => (
        <Link
          key={subsub.id}
          href={subsub.link ?? '#'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 ${
            isActive(subsub)
              ? 'bg-[#33907C] text-white font-medium'
              : 'text-white/40 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
          {subsub.title}
        </Link>
      ))}
    </div>
  );
}