import type { MaterialItem, ToolItem, UnitBrief } from '@/types/store';

export interface RawMaterialItem {
  id: number;
  name?: string;
  unit?: UnitBrief;
  quantity?: number;
  is_low_stock?: boolean | null;
  store_id?: number;
}

export function normaliseMaterialItem(raw: RawMaterialItem): MaterialItem {
  return {
    id: raw.id,
    name: raw.name ?? '',
    unit: raw.unit ?? { id: 0, name: '', symbol: '' },
    quantity: raw.quantity ?? 0,
    is_low_stock: raw.is_low_stock ?? false,
  };
}

export function normaliseMaterialItems(raw: RawMaterialItem[]): MaterialItem[] {
  return raw.map(normaliseMaterialItem);
}

export interface RawToolItem {
  id: number;
  name?: string;
  status?: string;
  vendor?: string | null;
  hire_end_date?: string | null;
  totalHireCost?: number | null;
  is_overdue?: boolean | null;
  store_id?: number;
}

export function normaliseToolItem(raw: RawToolItem): ToolItem {
  return {
    id: raw.id,
    name: raw.name ?? '',
    status: raw.status ?? '',
    vendor: raw.vendor ?? undefined,
    hire_end_date: raw.hire_end_date ?? undefined,
    total_hire_cost: raw.totalHireCost ?? undefined,
    is_overdue: raw.is_overdue ?? false,
  };
}

export function normaliseToolItems(raw: RawToolItem[]): ToolItem[] {
  return raw.map(normaliseToolItem);
}