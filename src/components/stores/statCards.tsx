import { Package, Wrench, XCircle, TrendingDown, Coins, AlertOctagon } from 'lucide-react';
import type { Variant } from '@/components/stores/StatCard';
import type { StoreSummary } from '@/types/store';
import { fmtKES } from '@/components/stores/format';

export interface StockStatCardConfig {
  label:    string;
  value:    string | number;
  sub:      string;
  icon:     React.ReactNode;
  variant:  Variant;
  onClick?: () => void;
}

interface Navigate {
  toMaterials: () => void;
  toTools:     () => void;
}

export function getStockStatCards(
  summary: StoreSummary,
  damagedTools: number,
  navigate: Navigate,
): StockStatCardConfig[] {
  return [
    {
      label: 'Total Materials', value: summary.total_materials,
      sub: 'Tap to view material details', icon: <Package size={18} />,
      variant: 'default', onClick: navigate.toMaterials,
    },
    {
      label: 'Low Stock Items', value: summary.low_stock_count,
      sub: 'Below minimum level', icon: <TrendingDown size={18} />,
      variant: summary.low_stock_count > 0 ? 'warn' : 'default',
    },
    {
      label: 'Total Tools', value: summary.total_tools,
      sub: 'Tap to view tools and their details', icon: <Wrench size={18} />,
      variant: 'default', onClick: navigate.toTools,
    },
    {
      label: 'Overdue Tools', value: summary.overdue_tools ?? 0,
      sub: 'Past their hire end date', icon: <XCircle size={18} />,
      variant: 'default',
    },
    {
      label: 'Damaged Tools', value: damagedTools,
      sub: 'Tools that need repair or replacement', icon: <AlertOctagon size={18} />,
      variant: 'default',
    },
    {
      label: 'Total Hire Cost', value: fmtKES(summary.total_hire_cost ?? 0),
      sub: 'Active tool hire cost', icon: <Coins size={18} />,
      variant: 'default',
    },
  ];
}