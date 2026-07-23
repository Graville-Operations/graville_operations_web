export interface Department {
  id: number;
  name: string;
  description: string;
  menusCount: number;
  usersCount: number;
}

export interface Menu {
  id: number;
  name: string;
  title: string;
  link?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Only used for the in-memory detail/menus/users caches below — the
// persisted department list has no TTL, it's valid until explicitly busted.
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const LS_DEPT_LIST = 'gv:departments:list';

function lsGet<T>(key: string): { value: T; ts: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }));
  } catch {
  }
}

function lsRemove(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

// ── Department list: persists indefinitely, no TTL ───────────────────────
// Departments rarely change, so once fetched (first login / first visit
// this browser), the list is trusted until bustDeptCache() runs — which
// should only happen after creating, editing, or deleting a department.

let deptListCache: Department[] | null = null;

export function getDeptCache(): Department[] | null {
  if (deptListCache) return deptListCache;

  const persisted = lsGet<Department[]>(LS_DEPT_LIST);
  if (persisted) {
    deptListCache = persisted.value;
    return persisted.value;
  }
  return null;
}

export function setDeptCache(depts: Department[]) {
  deptListCache = depts;
  lsSet(LS_DEPT_LIST, depts);
}

export function bustDeptCache() {
  deptListCache = null;
  lsRemove(LS_DEPT_LIST);
}

// ── Single department detail: in-memory only, session-scoped ────────────

const deptDetailCache = new Map<number, { value: Department; ts: number }>();

export function getCachedDepartment(id: number): Department | null {
  const mem = deptDetailCache.get(id);
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.value;

  const list = getDeptCache();
  const fromList = list?.find(d => d.id === id);
  if (fromList) return fromList;

  return null;
}

export function setCachedDepartment(dept: Department) {
  deptDetailCache.set(dept.id, { value: dept, ts: Date.now() });
}

// ── Menus & Users per department: in-memory only, session-scoped ────────

const deptMenusCache = new Map<number, { value: Menu[]; ts: number }>();
const deptUsersCache = new Map<number, { value: User[]; ts: number }>();

export function getCachedMenus(deptId: number): Menu[] | null {
  const mem = deptMenusCache.get(deptId);
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.value;
  return null;
}

export function setCachedMenus(deptId: number, menus: Menu[]) {
  deptMenusCache.set(deptId, { value: menus, ts: Date.now() });
}

export function getCachedUsers(deptId: number): User[] | null {
  const mem = deptUsersCache.get(deptId);
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.value;
  return null;
}

export function setCachedUsers(deptId: number, users: User[]) {
  deptUsersCache.set(deptId, { value: users, ts: Date.now() });
}

export function bustDeptDetailCache(deptId: number) {
  deptDetailCache.delete(deptId);
  deptMenusCache.delete(deptId);
  deptUsersCache.delete(deptId);
}