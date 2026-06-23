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

export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes


const LS_DEPT_LIST   = "gv:departments:list";
const LS_DEPT_DETAIL = (id: number) => `gv:dept:${id}:detail`;
const LS_DEPT_MENUS  = (id: number) => `gv:dept:${id}:menus`;
const LS_DEPT_USERS  = (id: number) => `gv:dept:${id}:users`;


function lsGet<T>(key: string): { value: T; ts: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }));
  } catch {
   
  }
}

function lsRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}


let deptListCache: Department[] | null = null;
let deptListCacheTs = 0;

const deptDetailCache = new Map<number, { value: Department & { description: string }; ts: number }>();
const deptMenusCache  = new Map<number, { value: Menu[]; ts: number }>();
const deptUsersCache  = new Map<number, { value: User[]; ts: number }>();


export function getDeptCache(): Department[] | null {
  if (deptListCache && Date.now() - deptListCacheTs < CACHE_TTL) {
    return deptListCache;
  }
  
  const persisted = lsGet<Department[]>(LS_DEPT_LIST);
  if (persisted) {
    deptListCache = persisted.value;
    deptListCacheTs = persisted.ts;
    return persisted.value;
  }
  return null;
}

export function setDeptCache(depts: Department[]) {
  deptListCache = depts;
  deptListCacheTs = Date.now();
  lsSet(LS_DEPT_LIST, depts);
}

export function bustDeptCache() {
  deptListCache = null;
  deptListCacheTs = 0;
  lsRemove(LS_DEPT_LIST);
}


export function getCachedDepartment(id: number): Department | null {
  const mem = deptDetailCache.get(id);
  if (mem) return mem.value;

 
  const list = getDeptCache();
  const fromList = list?.find(d => d.id === id);
  if (fromList) return fromList;

  
  const persisted = lsGet<Department & { description: string }>(LS_DEPT_DETAIL(id));
  if (persisted) {
    deptDetailCache.set(id, persisted);
    return persisted.value;
  }
  return null;
}

export function setCachedDepartment(dept: Department) {
  const entry = { value: dept, ts: Date.now() };
  deptDetailCache.set(dept.id, entry);
  lsSet(LS_DEPT_DETAIL(dept.id), dept);
}


export function getCachedMenus(deptId: number): Menu[] | null {
  const mem = deptMenusCache.get(deptId);
  if (mem) return mem.value;

  const persisted = lsGet<Menu[]>(LS_DEPT_MENUS(deptId));
  if (persisted) {
    deptMenusCache.set(deptId, persisted);
    return persisted.value;
  }
  return null;
}

export function setCachedMenus(deptId: number, menus: Menu[]) {
  const entry = { value: menus, ts: Date.now() };
  deptMenusCache.set(deptId, entry);
  lsSet(LS_DEPT_MENUS(deptId), menus);
}


export function getCachedUsers(deptId: number): User[] | null {
  const mem = deptUsersCache.get(deptId);
  if (mem) return mem.value;

  const persisted = lsGet<User[]>(LS_DEPT_USERS(deptId));
  if (persisted) {
    deptUsersCache.set(deptId, persisted);
    return persisted.value;
  }
  return null;
}

export function setCachedUsers(deptId: number, users: User[]) {
  const entry = { value: users, ts: Date.now() };
  deptUsersCache.set(deptId, entry);
  lsSet(LS_DEPT_USERS(deptId), users);
}


export function bustDeptDetailCache(deptId: number) {
  deptDetailCache.delete(deptId);
  deptMenusCache.delete(deptId);
  deptUsersCache.delete(deptId);
  lsRemove(LS_DEPT_DETAIL(deptId));
  lsRemove(LS_DEPT_MENUS(deptId));
  lsRemove(LS_DEPT_USERS(deptId));
}