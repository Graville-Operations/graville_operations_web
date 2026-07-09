import { TOOL_TABS } from '@/hooks/stores/useToolsDetail';
import type { ToolTab } from '@/types/store';

interface ToolsTabBarProps {
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
}

export function ToolsTabBar({ activeTab, onTabChange }: ToolsTabBarProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted">
      {TOOL_TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 h-7 rounded-md text-xs font-medium transition-all ${
            activeTab === t.key
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}