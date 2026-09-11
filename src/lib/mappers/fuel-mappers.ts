import { FuelType, FuelVehicleSummary, FuelLogEntry, FuelVehicleDetail } from '@/types/fuel';

export function normaliseFuelVehicleSummary(raw: unknown): FuelVehicleSummary {
  const r = raw as Record<string, unknown>;
  const fuelTypeRaw = r.fuel_type ?? r.fuelType;
  return {
    id: Number(r.id ?? r.transport_id ?? r.vehicle_id),
    vehicle: String(r.vehicle ?? r.number_plate ?? r.name ?? ''),
    fuelType: (fuelTypeRaw ? String(fuelTypeRaw).toLowerCase() : '') as FuelType,
    totalAmount: Number(
      r.total_amount ?? r.totalAmount ?? r.total_fuel_amount ?? r.total_fuel_cost ?? 0
    ),
  };
}

export function normaliseFuelLogEntry(raw: unknown): FuelLogEntry {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id),
    date: String(r.date ?? r.created_at ?? r.logged_at ?? ''),
    purpose: String(r.purpose ?? r.description ?? ''),
    amount: Number(r.amount ?? 0),
  };
}

export function normaliseFuelVehicleDetail(raw: unknown): FuelVehicleDetail {
  const r = raw as Record<string, unknown>;
  const logsRaw = Array.isArray(r.logs)
    ? r.logs
    : Array.isArray(r.fuel_logs)
    ? r.fuel_logs
    : Array.isArray(r.entries)
    ? r.entries
    : [];
  return {
    ...normaliseFuelVehicleSummary(raw),
    logs: logsRaw.map(normaliseFuelLogEntry),
  };
}