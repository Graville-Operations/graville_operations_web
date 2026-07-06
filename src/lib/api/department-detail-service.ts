import api from '@/lib/api';
import { parseMenus, parseUsers } from '@/lib/utils/parse-entities';
import { DeptDetail, Menu, User } from '@/types/department-detail';

export const departmentDetailService = {
  async getDepartment(id: number): Promise<DeptDetail> {
    const { data } = await api.get(`/departments/${id}`);
    const d = (data?.data ?? data) as any;
    return { id: d.id, name: d.name, description: d.description };
  },

  async getMenus(id: number): Promise<Menu[]> {
    const { data } = await api.get(`/departments/${id}/menus`);
    return parseMenus(data);
  },

  async getMembers(id: number): Promise<User[]> {
    const { data } = await api.get(`/departments/${id}/members`);
    return parseUsers(data, '/members');
  },

   async listAllMenus(): Promise<Menu[]> {
    const { data } = await api.get('/menus/list');
    return parseMenus(data);
  },

  /** Full user catalog, used by the "Assign User" picker. */
  async listAllUsers(): Promise<User[]> {
    const { data } = await api.get('/users/list');
    return parseUsers(data, '/users/list');
  },

  async assignMenus(deptId: number, menuIds: number[]) {
    return api.post(`/departments/${deptId}/menus`, { menu_ids: menuIds });
  },

  async removeMenu(deptId: number, menuId: number) {
    return api.delete(`/departments/${deptId}/menus`, { data: { menu_ids: [menuId] } });
  },

  async assignUsers(deptId: number, userIds: number[]) {
    return api.post(`/departments/${deptId}/assign-users`, { user_ids: userIds });
  },

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