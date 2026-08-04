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
    const [{ data: membersData }, { data: usersData }] = await Promise.all([
      api.get(API.departments.members(id)),
      api.get(API.users.list),
    ]);
    const members = parseUsers(membersData, '/members');
    const allUsers = parseUsers(usersData, '/users/list');

    const idByEmail = new Map(
      allUsers.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u.id]),
    );

    return members.map((m) => ({
      ...m,
      id: idByEmail.get(m.email.toLowerCase()) ?? m.id,
    }));
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

  async removeUser(deptId: number, userId: number) {
    return api.delete(API.departments.users(deptId), { data: { user_ids: [userId] } });
  },
};