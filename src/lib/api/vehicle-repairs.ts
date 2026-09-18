
import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import {
  VehicleRepair,
  CreateRepairPayload,
  RepairActionPayload,
  RepairCompletePayload,
} from '@/types/vehicle-repair';
import { VehicleRepairStatus } from '@/types/enums/vehicle-repair';

export interface RepairListParams {
  transport_id?: number;
  status?: VehicleRepairStatus;
  search?: string;
  start_date?: string; 
  end_date?: string;   
  limit?: number;
}

export const vehicleRepairsService = {
  async listAll(params?: RepairListParams) {
    const { data } = await api.get(API.repairs.all, { params });
    const items: VehicleRepair[] = data?.data?.items ?? [];
    const total: number = data?.data?.total ?? items.length;
    return { items, total };
  },

  async listAwaitingApproval(params?: Omit<RepairListParams, 'status' | 'transport_id'>) {
    const { data } = await api.get(API.repairs.awaitingApproval, { params });
    const items: VehicleRepair[] = data?.data?.items ?? [];
    const total: number = data?.data?.total ?? items.length;
    return { items, total };
  },

  async getAwaitingApprovalDetail(id: number): Promise<VehicleRepair> {
    const { data } = await api.get(API.repairs.awaitingApprovalDetail(id));
    return data?.data as VehicleRepair;
  },

  async getDetail(id: number): Promise<VehicleRepair> {
    const { data } = await api.get(API.repairs.details(id));
    return data?.data as VehicleRepair;
  },

  async create(payload: CreateRepairPayload): Promise<VehicleRepair> {
    const { data } = await api.post(API.repairs.create, payload);
    return data?.data as VehicleRepair;
  },

  async action(id: number, payload: RepairActionPayload): Promise<VehicleRepair> {
    const { data } = await api.patch(API.repairs.action(id), payload);
    return data?.data as VehicleRepair;
  },

  async complete(id: number, payload: RepairCompletePayload = {}): Promise<VehicleRepair> {
    const { data } = await api.patch(API.repairs.complete(id), payload);
    return data?.data as VehicleRepair;
  },
};