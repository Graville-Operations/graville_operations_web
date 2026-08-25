export interface VehicleCategory {
  id: number;
  name: string;
  company_id: number;
  created_at: string;
}

export interface CreateVehicleCategoryPayload {
  name: string;
}

export interface UpdateVehicleCategoryPayload {
  name?: string;
}

/** A driver assigned to a vehicle, as embedded in the ModeOfTransport response. */
export interface DriverBrief {
  id: number;
  first_name: string;
  last_name: string;
  phone_no?: string | null;
  national_id?: string | null;
}

export interface ModeOfTransport {
  id: number;
  name: string;
  number_plate: string;
  driver: DriverBrief | null;
  is_active: boolean;
  category_id: number;
  company_id: number;
  created_at: string;
  category_name?: string;
}

export interface CreateModeOfTransportPayload {
  category_id: number;
  number_plate: string;
  driver_id?: number | null;
}

export interface UpdateModeOfTransportPayload {
  number_plate?: string;
  driver_id?: number | null;
  is_active?: boolean;
}

export type ToastState = { message: string; type: 'success' | 'error' } | null;