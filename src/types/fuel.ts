export type FuelType = 'diesel' | 'petrol';

export interface FuelVehicleSummary {
  id: number;
  vehicle: string;
  fuelType: FuelType;
  totalAmount: number;
}

export interface FuelLogEntry {
  id: number;
  date: string; // ISO date
  purpose: string;
  amount: number;
}

export interface FuelVehicleDetail extends FuelVehicleSummary {
  logs: FuelLogEntry[];
}

export interface CreateFuelLogPayload {
  transportId: number;
  date: string;
  purpose: string;
  amount: number;
}