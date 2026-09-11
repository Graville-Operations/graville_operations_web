import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { VehicleService, CreateServiceRequestPayload } from '@/types/vehicle-service';
import { VehicleServiceStatus } from '@/types/enums/vehicle-service';

export const vehicleServicesService = {
  async listAll(params?: { transport_id?: number; status?: VehicleServiceStatus; skip?: number; limit?: number }) {
    const { data } = await api.get(API.services.all, { params });
    // Response shape: { code, data: { items, total, skip, limit }, message }
    const items: VehicleService[] = data?.data?.items ?? [];
    const total: number = data?.data?.total ?? items.length;
    return { items, total };
  },

  async create(payload: CreateServiceRequestPayload): Promise<VehicleService> {
    const { data } = await api.post(API.services.create, payload);
    // Response shape: { code, data: {...request}, message }
    return data?.data as VehicleService;
  },
};