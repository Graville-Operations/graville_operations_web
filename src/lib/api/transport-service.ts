import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseList } from '@/lib/utils/parse-list';
import { unwrapObject } from '@/lib/api-response';
import { ApiUser } from '@/types/users';
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

export const driversService = {
  /** Users with the "Drivers" role, sourced from the dedicated drivers endpoint. */
  async list(): Promise<ApiUser[]> {
    const { data } = await api.get(API.transport.drivers, { params: { skip: 0, limit: 100 } });
    return parseList(data) as ApiUser[];
  },
};

export const modesOfTransportService = {
  async list(): Promise<ModeOfTransport[]> {
    const { data } = await api.get(API.transport.modesOfTransport);
    return parseList(data) as ModeOfTransport[];
  },

  async create(payload: CreateModeOfTransportPayload): Promise<ModeOfTransport> {
    const { data } = await api.post(API.transport.createModeOfTransport, payload);
    return unwrapObject<ModeOfTransport>(data);
  },

  async update(id: number, payload: UpdateModeOfTransportPayload): Promise<ModeOfTransport> {
    const { data } = await api.put(API.transport.updateModeOfTransport(id), payload);
    return unwrapObject<ModeOfTransport>(data);
  },

  async unassignDriver(id: number): Promise<ModeOfTransport> {
    const { data } = await api.post(API.transport.unassignDriver(id));
    return unwrapObject<ModeOfTransport>(data);
  },
};