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

export interface ModeOfTransport {
  id: number;
  name: string;
  number_plate: string;
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_national_id?: string | null;
  is_active: boolean;
  category_id: number;
  company_id: number;
  created_at: string;
  category_name?: string;
}

export interface CreateModeOfTransportPayload {
  category_id: number;
  number_plate: string;
  name?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_national_id?: string;
}

export interface UpdateModeOfTransportPayload {
  category_id?: number;
  number_plate?: string;
  name?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_national_id?: string;
  is_active?: boolean;
}

export type ToastState = { message: string; type: 'success' | 'error' } | null;