import { ToolStatus } from '@/types/enums/tool-status';
import { UsageStatus } from '@/types/enums/usage-status';
import { UsageLogStatus } from '@/types/enums/usage-log-status';
import { ToolTab } from '@/types/enums/tool-tab';
import { DetailType } from '@/types/enums/detail-type';
import { StockTab } from '@/types/enums/stock-tab';
import { ActivityTab } from '@/types/enums/activity-tab';
import type { SiteBrief } from '@/types/site';

export { ToolStatus, UsageStatus, UsageLogStatus, ToolTab, DetailType, StockTab, ActivityTab };

export type Site = SiteBrief;

export interface UnitBrief {
  id: number;
  name: string;
  symbol: string;
}

export interface LowStockSite {
  siteId: number;
  siteName: string;
  lowStockMaterialCount: number;
}

export interface StoreTotals {
  totalOrders: number;
  lowStockSites: LowStockSite[];
  totalMaterialQuantity: number;
  totalToolsQuantity: number;
  totalTransfers: number;
  totalDamagedTools: number;
  totalHireCost: number;
}

export interface LowStockSiteDTO {
  siteId: number;
  siteName?: string;
  lowStockMaterialCount?: number;
}

export interface StoreTotalsDTO {
  totalOrders?: number;
  lowStockSites?: LowStockSiteDTO[];
  totalMaterialQuantity?: number;
  totalToolsQuantity?: number;
  totalTransfers?: number;
  totalDamagedTools?: number;
  totalHireCost?: number;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
}


export interface StoreSummary {
  total_materials: number;
  low_stock_count: number;
  tools_available: number;
  tools_in_use: number;
  tools_damaged: number;
  total_hire_cost: number;
  total_tools: number;
  overdue_tools: number;
}

export interface MaterialItem {
  id: number;
  name: string;
  unit: UnitBrief;
  quantity: number;
  is_low_stock: boolean;
}

export interface MaterialItemDTO {
  id: number;
  name?: string;
  unit?: UnitBrief;
  quantity?: number;
  is_low_stock?: boolean | null;
  store_id?: number;
}

export interface StoreMaterial {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  minimumStockLevel: number | null;
  unit: UnitBrief;
}

export interface ToolItem {
  id: number;
  name: string;
  status: ToolStatus | string;
  vendor?: string;
  hire_end_date?: string;
  total_hire_cost?: number;
  is_overdue?: boolean;
}

export interface ToolItemDTO {
  id: number;
  name?: string;
  status?: string;
  vendor?: string | null;
  hire_end_date?: string | null;
  totalHireCost?: number | null;
  is_overdue?: boolean | null;
  store_id?: number;
}

export interface StoreTool {
  id: number;
  name: string;
  description?: string;
  status: ToolStatus | string;
  vendor?: string;
  billing_type?: string;
  totalHireCost?: number;
  hire_start_date?: string;
  hire_end_date?: string;
  is_overdue?: boolean;
}

export interface DailyUsageItem {
  material: { name: string; unit: { symbol: string } };
  quantity_used: number;
  notes?: string;
}

export interface DailyUsageRecord {
  id: number;
  usage_date: string;
  status: UsageStatus | string;
  notes?: string;
  items: DailyUsageItem[];
}


export interface ReceiptRecord {
  id: number;
  material: { name: string; unit: { symbol: string } };
  quantity: number;
  unit_price: number;
  notes?: string;
  received_at: string;
}

export type MaybeArray<T> = T[] | { items?: T[] };

export interface StoreActivityResponse {
  items?: ReceiptRecord[];
  receipts?: ReceiptRecord[];
  receipt_history?: ReceiptRecord[];
  material_receipts?: ReceiptRecord[];
}

export interface UsageLog {
  id: number;
  site_name: string;
  date: string;
  notes: string;
  materials_count: number;
  orders_count: number;
  status?: UsageLogStatus | string;
}