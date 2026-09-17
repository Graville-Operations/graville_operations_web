// src/lib/api/vehicle-services.ts

import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { VehicleService, CreateServiceRequestPayload, ServiceRequestActionPayload, ServiceRequestCompletePayload } from '@/types/vehicle-service';
import { VehicleServiceStatus } from '@/types/enums/vehicle-service';

export const vehicleServicesService = {
  async listAll(params?: { transport_id?: number; status?: VehicleServiceStatus; skip?: number; limit?: number }) {
    const { data } = await api.get(API.services.all, { params });
    const items: VehicleService[] = data?.data?.items ?? [];
    const total: number = data?.data?.total ?? items.length;
    return { items, total };
  },

  async listAwaitingApproval(params?: { skip?: number; limit?: number }) {
    const { data } = await api.get(API.services.awaitingApproval, { params });
    const items: VehicleService[] = data?.data?.items ?? [];
    const total: number = data?.data?.total ?? items.length;
    return { items, total };
  },

  async getDetail(id: number): Promise<VehicleService> {
    const { data } = await api.get(API.services.detail(id));
    return data?.data as VehicleService;
  },

  async create(payload: CreateServiceRequestPayload): Promise<VehicleService> {
    const { data } = await api.post(API.services.create, payload);
    return data?.data as VehicleService;
  },

  async action(id: number, payload: ServiceRequestActionPayload): Promise<VehicleService> {
    const { data } = await api.patch(API.services.action(id), payload);
    return data?.data as VehicleService;
  },

  async complete(id: number, payload: ServiceRequestCompletePayload = {}): Promise<VehicleService> {
    const { data } = await api.patch(API.services.complete(id), payload);
    return data?.data as VehicleService;
  },
};