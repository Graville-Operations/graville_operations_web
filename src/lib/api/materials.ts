import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray } from '@/lib/api-response';
import { MaterialCatalogItem } from '@/types/store';

export const materialsService = {
  async list(): Promise<MaterialCatalogItem[]> {
    const { data } = await api.get(API.materials.all, { params: { limit: 100, skip: 0 } });
    return unwrapArray<MaterialCatalogItem>(data);
  },
};