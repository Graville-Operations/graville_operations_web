import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import { ExternalWorkApiResponse, CreateExternalWorkPayload, ExternalWorkType } from '@/types/external-work';

export interface ExternalWorkPage {
  items: ExternalWorkApiResponse[];
  total: number;
}

export const externalWorkService = {
  async list(): Promise<ExternalWorkApiResponse[]> {
    const { data } = await api.get(API.externalWork.all, {
      params: { limit: 100 },
    });
    return unwrapArray<ExternalWorkApiResponse>(data);
  },
  async listByType(
    workType: ExternalWorkType,
    params: { skip?: number; limit?: number } = {},
  ): Promise<ExternalWorkPage> {
    const { data } = await api.get(API.externalWork.all, {
      params: { work_type: workType, skip: params.skip ?? 0, limit: params.limit ?? 20 },
    });
    const items = unwrapArray<ExternalWorkApiResponse>(data);
    const total = typeof data?.data?.total === 'number' ? data.data.total : items.length;
    return { items, total };
  },

  async create(payload: CreateExternalWorkPayload): Promise<ExternalWorkApiResponse> {
    const { data } = await api.post(API.externalWork.create, payload);
    return unwrapObject<ExternalWorkApiResponse>(data);
  },
};