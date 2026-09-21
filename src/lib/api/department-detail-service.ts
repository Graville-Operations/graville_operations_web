import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseMenus, parseUsers } from '@/lib/utils/parse-entities';
import { DeptDetail, Menu, User } from '@/types/department-detail';
import { ENTITY_CACHE_KEYS, fetchWithCache, clearEntityCache } from '@/lib/api/cache';

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
    return fetchWithCache(ENTITY_CACHE_KEYS.menus, async () => {
      const { data } = await api.get(API.menus.list);
      return parseMenus(data);
    });
  },

  async assignMenus(deptId: number, menuIds: number[]) {
    const res = await api.post(API.departments.menus(deptId), { menu_ids: menuIds });
    // Assigning menus changes this department's menusCount in the cached list.
    clearEntityCache(ENTITY_CACHE_KEYS.departments);
    clearEntityCache(ENTITY_CACHE_KEYS.departmentsBrief);
    return res;
  },

  async removeMenu(deptId: number, menuId: number) {
    const res = await api.delete(API.departments.menus(deptId), { data: { menu_ids: [menuId] } });
    clearEntityCache(ENTITY_CACHE_KEYS.departments);
    clearEntityCache(ENTITY_CACHE_KEYS.departmentsBrief);
    return res;
  },

  async assignUsers(deptId: number, userIds: number[]) {
    const res = await api.post(API.departments.assignUsers(deptId), { user_ids: userIds });
    // Assigning users changes this department's usersCount in the cached list.
    clearEntityCache(ENTITY_CACHE_KEYS.departments);
    clearEntityCache(ENTITY_CACHE_KEYS.departmentsBrief);
    clearEntityCache(ENTITY_CACHE_KEYS.users);
    return res;
  },

  async removeUser(deptId: number, userId: number) {
    const res = await api.delete(API.departments.users(deptId), { data: { user_ids: [userId] } });
    clearEntityCache(ENTITY_CACHE_KEYS.departments);
    clearEntityCache(ENTITY_CACHE_KEYS.departmentsBrief);
    clearEntityCache(ENTITY_CACHE_KEYS.users);
    return res;
  },
};