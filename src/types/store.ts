export interface Site {
  id: number;
  name: string;
}

export interface UnitBrief {
  id: number;
  name: string;
  symbol: string;
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
  minimum_stock: number;
}

export interface StoreMaterial {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  minimumStockLevel: number | null;
  unit: UnitBrief;
}


export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'RETIRED';

export interface ToolItem {
  id: number;
  name: string;
  status: ToolStatus | string;
  hire_cost?: number;
  vendor?: string;
}

export interface StoreTool {
  id: number;
  name: string;
  description?: string;
  status: ToolStatus | string;
  vendor?: string;
  billing_type?: string;
  hireCost?: number;
  hire_start_date?: string;
  hire_end_date?: string;
}


export type UsageStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

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

export type ToolTab = 'all' | 'available' | 'in_use' | 'damaged';
export type DetailType = 'materials' | 'tools' | null;
export type StockTab = 'materials' | 'tools';
export type ActivityTab = 'usage' | 'orders';