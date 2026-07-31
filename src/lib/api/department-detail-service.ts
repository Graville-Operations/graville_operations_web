import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseMenus, parseUsers } from '@/lib/utils/parse-entities';
import { DeptDetail, Menu, User } from '@/types/department-detail';

export const departmentDetailService = {
  async getDepartment(id: number): Promise<DeptDetail> {
    const { data } = await api.get(API.departments.detail(id));
    const d = (data?.data ?? data) as any;
    return { id: d.id, name: d.name, description: d.description };
  },

  async getMenus(id: number): Promise<Menu[]> {
    const { data } = await api.get(API.departments.menus(id));
    return parseMenus(data);
  },

  async getMembers(id: number): Promise<User[]> {
    const { data } = await api.get(API.departments.members(id));
    return parseUsers(data, '/members');
  },

   async listAllMenus(): Promise<Menu[]> {
    const { data } = await api.get(API.menus.list);
    return parseMenus(data);
  },

  async assignMenus(deptId: number, menuIds: number[]) {
    return api.post(API.departments.menus(deptId), { menu_ids: menuIds });
  },

  async removeMenu(deptId: number, menuId: number) {
    return api.delete(API.departments.menus(deptId), { data: { menu_ids: [menuId] } });
  },

  async assignUsers(deptId: number, userIds: number[]) {
    return api.post(API.departments.assignUsers(deptId), { user_ids: userIds });
  },

  // NOTE: left as raw literals — actual "remove member" endpoint not yet
  // confirmed with backend team (none of these three match current swagger).
  async removeUser(deptId: number, userId: number) {
    const attempts: Array<() => Promise<unknown>> = [
      () => api.delete(`/departments/${deptId}/members`, { data: { user_ids: [userId] } }),
      () => api.delete(`/departments/${deptId}/users`, { data: { user_ids: [userId] } }),
      () => api.post(`/departments/${deptId}/members/remove`, { user_ids: [userId] }),
    ];

    let lastErr: unknown = null;
    for (const attempt of attempts) {
      try {
        await attempt();
        return;
      } catch (err) {
        lastErr = err;
        const status = (err as any)?.response?.status;
        if (status !== 404 && status !== 405) throw err;
      }
    }
    throw lastErr;
  },
};