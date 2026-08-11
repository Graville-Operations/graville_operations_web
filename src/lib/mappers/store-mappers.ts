import type { MaterialItem, MaterialItemDTO, ToolItem, ToolItemDTO, StoreTotals, StoreTotalsDTO, LowStockSite, LowStockSiteDTO } from '@/types/store';

export function normaliseMaterialItem(dto: MaterialItemDTO): MaterialItem {
  return {
    id: dto.id,
    name: dto.name ?? '',
    unit: dto.unit ?? { id: 0, name: '', symbol: '' },
    quantity: dto.quantity ?? 0,
    is_low_stock: dto.is_low_stock ?? false,
  };
}

export function normaliseMaterialItems(dtos: MaterialItemDTO[]): MaterialItem[] {
  return dtos.map(normaliseMaterialItem);
}

export function normaliseToolItem(dto: ToolItemDTO): ToolItem {
  return {
    id: dto.id,
    name: dto.name ?? '',
    status: dto.status ?? '',
    vendor: dto.vendor ?? undefined,
    hire_end_date: dto.hire_end_date ?? undefined,
    total_hire_cost: dto.totalHireCost ?? undefined,
    is_overdue: dto.is_overdue ?? false,
  };
}

export function normaliseToolItems(dtos: ToolItemDTO[]): ToolItem[] {
  return dtos.map(normaliseToolItem);
}

export function normaliseLowStockSite(dto: LowStockSiteDTO): LowStockSite {
  return {
    siteId: dto.siteId,
    siteName: dto.siteName ?? '',
    lowStockMaterialCount: dto.lowStockMaterialCount ?? 0,
  };
}

export function normaliseStoreTotals(dto: StoreTotalsDTO): StoreTotals {
  return {
    totalOrders: dto.totalOrders ?? 0,
    lowStockSites: (dto.lowStockSites ?? []).map(normaliseLowStockSite),
    totalMaterialQuantity: dto.totalMaterialQuantity ?? 0,
    totalToolsQuantity: dto.totalToolsQuantity ?? 0,
    totalTransfers: dto.totalTransfers ?? 0,
    totalDamagedTools: dto.totalDamagedTools ?? 0,
    totalHireCost: dto.totalHireCost ?? 0,
  };
}