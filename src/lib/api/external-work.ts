import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import { ExternalWorkApiResponse, CreateExternalWorkPayload } from '@/types/external-work';

export const externalWorkService = {
  async list(): Promise<ExternalWorkApiResponse[]> {
    const { data } = await api.get(API.externalWork.all, {
      params: { limit: 100 },
    });
    return unwrapArray<ExternalWorkApiResponse>(data);
  },

  async create(payload: CreateExternalWorkPayload): Promise<ExternalWorkApiResponse> {
    const { data } = await api.post(API.externalWork.create, payload);
    return unwrapObject<ExternalWorkApiResponse>(data);
  },
};