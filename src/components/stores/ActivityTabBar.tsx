import { ClipboardList, ShoppingCart } from 'lucide-react';
import type { ActivityTab } from '@/types/store';

const TABS: { key: ActivityTab; label: string; icon: React.ReactNode }[] = [
  { key: 'usage',  label: 'Daily Usage', icon: <ClipboardList size={14} /> },
  { key: 'orders', label: 'Orders',      icon: <ShoppingCart size={14} /> },
];

interface ActivityTabBarProps {
  tab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
}

export function ActivityTabBar({ tab, onTabChange }: ActivityTabBarProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
            tab === t.key
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}