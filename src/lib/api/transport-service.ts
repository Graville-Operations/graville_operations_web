import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseList } from '@/lib/utils/parse-list';
import {
  VehicleCategory,
  CreateVehicleCategoryPayload,
  UpdateVehicleCategoryPayload,
  ModeOfTransport,
  CreateModeOfTransportPayload,
  UpdateModeOfTransportPayload,
} from '@/types/transport';

export const vehicleCategoriesService = {
  async list(): Promise<VehicleCategory[]> {
    const { data } = await api.get(API.transport.vehicleCategories);
    return parseList(data) as VehicleCategory[];
  },

  async create(payload: CreateVehicleCategoryPayload) {
    return api.post(API.transport.createVehicleCategory, { name: payload.name.trim() });
  },

  async update(id: number, payload: UpdateVehicleCategoryPayload) {
    return api.put(API.transport.updateVehicleCategory(id), payload);
  },
};

export const modesOfTransportService = {
  async list(): Promise<ModeOfTransport[]> {
    const { data } = await api.get(API.transport.modesOfTransport);
    return parseList(data) as ModeOfTransport[];
  },

  async create(payload: CreateModeOfTransportPayload) {
    return api.post(API.transport.createModeOfTransport, payload);
  },

  async update(id: number, payload: UpdateModeOfTransportPayload) {
    return api.put(API.transport.updateModeOfTransport(id), payload);
  },
};