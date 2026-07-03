import api from '@/lib/api';
import { parseList } from '@/lib/utils/parse-list';
import { CreateDepartmentPayload, RawDepartment } from '@/types/department';

export const departmentsService = {
  async list(): Promise<RawDepartment[]> {
    const { data } = await api.get('/departments/list');
    return parseList(data) as RawDepartment[];
  },

  async create(payload: CreateDepartmentPayload) {
    return api.post('/departments/create', {
      name: payload.name.trim(),
      description: payload.description.trim(),
    });
  },
};