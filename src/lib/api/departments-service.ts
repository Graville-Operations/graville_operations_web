import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseList } from '@/lib/utils/parse-list';
import { CreateDepartmentPayload, RawDepartment } from '@/types/department';
import { ENTITY_CACHE_KEYS, fetchWithCache, clearEntityCache } from '@/lib/api/cache';

export const departmentsService = {
  async list(): Promise<RawDepartment[]> {
    return fetchWithCache(ENTITY_CACHE_KEYS.departments, async () => {
      const { data } = await api.get(API.departments.list);
      return parseList(data) as RawDepartment[];
    });
  },

  async create(payload: CreateDepartmentPayload) {
    const res = await api.post(API.departments.create, {
      name: payload.name.trim(),
      description: payload.description.trim(),
    });
    clearEntityCache(ENTITY_CACHE_KEYS.departments);
    clearEntityCache(ENTITY_CACHE_KEYS.departmentsBrief);
    return res;
  },
};