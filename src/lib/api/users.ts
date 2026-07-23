import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { ApiUser } from '@/types';
import { Department, Role, NewUserFormState } from '@/types/users';
import { RoleFormState } from '@/types/users';
import { clearCachedLookup } from '@/hooks/useCachedLookup';

export function unwrap<T>(data: unknown): T {
  const payload = (data as { data?: unknown })?.data ?? data;
  return payload as T;
}

export function unwrapList<T>(data: unknown): T[] {
  const payload = unwrap<T[] | { items?: T[] }>(data);
  if (Array.isArray(payload)) return payload;
  return (payload as { items?: T[] })?.items ?? [];
}

export async function fetchUsers(): Promise<ApiUser[]> {
  const { data } = await api.get(API.users.list);
  return unwrapList<ApiUser>(data);
}

export async function fetchUser(id: number): Promise<ApiUser> {
  const { data } = await api.get(API.users.get(id));
  return unwrap<ApiUser>(data);
}

export async function fetchUserDepartments(id: number): Promise<Department[]> {
  const { data } = await api.get(API.users.departments(id));
  return unwrapList<Department>(data);
}

const ROLES_CACHE_KEY = 'gv:roles';

export async function fetchRoles(forceRefresh = false): Promise<Role[]> {
  if (!forceRefresh) {
    const cached = cacheGet<Role[]>(ROLES_CACHE_KEY);
    if (cached) return cached;
  }

  const { data } = await api.get(API.roles.list);
  const roles = unwrapList<Role>(data);
  cacheSet(ROLES_CACHE_KEY, roles);
  return roles;
}

export async function fetchDepartments(): Promise<Department[]> {
  const { data } = await api.get(API.departments.list, { params: { skip: 0, limit: 100 } });
  return unwrapList<Department>(data);
}

export async function createUser(form: NewUserFormState): Promise<{ id: number }> {
  const { data: created } = await api.post(API.users.create, {
    first_name:    form.first_name,
    last_name:     form.last_name,
    email:         form.email,
    phone_no:      form.phone_no || null,
    role_id:       Number(form.role_id),
    department_id: form.department_id ? Number(form.department_id) : null,
    site_ids:      form.site_ids,
  });

  const id: number = created?.data?.id ?? created?.id ?? created?.user?.id;

  clearCachedLookup(API.users.list);

  return { id };
}

export async function assignUserToDepartment(
  departmentId: number | string,
  userIds: number[]
): Promise<void> {
  await api.post(API.departments.assignUsers(departmentId as number), { user_ids: userIds });
  clearCachedLookup(API.users.list);
}

export async function createRole(payload: RoleFormState): Promise<void> {
  await api.post(API.roles.create, payload);
  clearCachedLookup(API.roles.list);
  cacheBust(ROLES_CACHE_KEY);
}

export async function updateRole(id: number, payload: RoleFormState): Promise<void> {
  await api.patch(API.roles.update(id), payload);
  clearCachedLookup(API.roles.list);
  cacheBust(ROLES_CACHE_KEY);
}

export async function deleteRole(id: number): Promise<void> {
  await api.delete(API.roles.delete(id));
  clearCachedLookup(API.roles.list);
  cacheBust(ROLES_CACHE_KEY);
}

export function assignRoleToUser(roleId: number, userId: number) {
  clearCachedLookup(API.users.list); // a user's role changed — user list view may show it
  return api.post(API.roles.assign(roleId, userId));
}

interface CacheEntry<T> {
  data: T;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {

  }
}

export function cacheBust(prefix: string): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}