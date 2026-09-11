import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseList } from '@/lib/utils/parse-list';
import { unwrapObject } from '@/lib/api-response';
import { normaliseFuelVehicleSummary, normaliseFuelVehicleDetail } from '@/lib/mappers/fuel-mappers';
import { FuelType, FuelVehicleSummary, FuelVehicleDetail, CreateFuelLogPayload } from '@/types/fuel';

export const fuelService = {
  async listVehicleSummaries(params?: {
    fuelType?: FuelType | '';
    search?: string;
  }): Promise<FuelVehicleSummary[]> {
    const { data } = await api.get(API.fuel.vehicles, {
      params: {
        fuel_type: params?.fuelType || undefined,
        search: params?.search || undefined,
      },
    });
    return parseList(data).map(normaliseFuelVehicleSummary);
  },

  async getVehicleDetail(transportId: number): Promise<FuelVehicleDetail> {
    const { data } = await api.get(API.fuel.vehicleDetail(transportId));
    return normaliseFuelVehicleDetail(unwrapObject(data));
  },

  async createLog(payload: CreateFuelLogPayload) {
    const { data } = await api.post(API.fuel.log, {
      transport_id: payload.transportId,
      date: payload.date,
      purpose: payload.purpose,
      amount: payload.amount,
    });
    return unwrapObject(data);
  },
};