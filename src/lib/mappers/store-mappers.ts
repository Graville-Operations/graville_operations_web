import type { MaterialItem, MaterialItemDTO, ToolItem, ToolItemDTO } from '@/types/store';

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