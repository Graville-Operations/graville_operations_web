/**
 * Local (offline) cache for the core lookup entities: users, roles, menus,
 * sites and departments.
 *
 * Every entity gets its own storage key. The fetch flow, via the
 * `fetchWithCache` helper below, is always exactly these steps — no bypass:
 *
 *   1. Check the local db (localStorage) for that key.
 *   2. If it's there, return it — no network call.
 *   3. If it isn't, call the API.
 *   4. Save what came back into the local db under that key.
 *   5. Return it.
 *
 * There is no TTL and no "skip the cache" flag. A cached entry is valid
 * until something explicitly clears it:
 *   - `clearEntityCache`, called by that entity's create/update/delete, or
 *   - a CACHE_VERSION bump (see below), for when the backend response shape
 *     itself changes.
 *
 * THIS IS THE ONLY PLACE THE APP CACHES DATA. Nothing else in the project
 * should read or write localStorage/sessionStorage for caching, keep its own
 * module-level Map/TTL, or use a store `persist` middleware for data that
 * comes from the API. Add a key below and go through the helpers in this
 * file instead.
 *
 * SCHEMA CHANGES: because there's no TTL, a cached entry from before a
 * backend response shape changed (e.g. a new field was added) would
 * otherwise sit there forever — no mutation runs on the client to bust it,
 * so a normal reload keeps serving the old, incomplete shape. CACHE_VERSION
 * exists for that: bump it whenever you ship a change to what one of these
 * endpoints returns, and every cached entity is wiped automatically on the
 * user's next load, no manual clearing required.
 */

const PREFIX = 'gv:cache:';

/**
 * Bump this whenever a cached entity's response shape changes on the
 * backend (new/renamed/removed field, etc.) so old cached copies are
 * invalidated on next load instead of silently going stale.
 */
const CACHE_VERSION = 2;
const VERSION_KEY = `${PREFIX}version`;

/**
 * Storage keys written by the old, now-removed caching code (persistent-cache,
 * departments-cache and the zustand `persist` stores). They're orphaned now
 * and would otherwise sit in users' browsers forever — `graville_profile`
 * even holds an email/phone number — so the version bump above also sweeps
 * them out, once.
 */
const LEGACY_KEYS = ['graville_menus', 'graville_profile', 'gv:departments:list'];
const LEGACY_KEY_PREFIXES = ['subtasks:', 'tasks:'];

export const ENTITY_CACHE_KEYS = {
  /** GET /users/list */
  users: `${PREFIX}users`,
  /** GET /roles/list */
  roles: `${PREFIX}roles`,
  /** GET /menus/list (shared by the admin menu list and "assign menus" pickers) */
  menus: `${PREFIX}menus`,
  /** GET /auth/me/menus — the logged-in user's sidebar tree, kept separate
   *  from the admin `menus` list above since it's a different shape/endpoint. */
  sidebarMenus: `${PREFIX}sidebar-menus`,
  /** GET /sites/list */
  sites: `${PREFIX}sites`,
  /** GET /departments/list */
  departments: `${PREFIX}departments`,
  /** GET /departments/list — the lightweight { id, name } variant some
   *  callers use, kept separate since it's a different shape than `departments`. */
  departmentsBrief: `${PREFIX}departments-brief`,
  /** GET /client-invoices?limit=5 — the homepage's "recent invoices" widget
   *  only. Kept separate from the full, filterable Client Invoices section
   *  page (which uses different params per filter and is intentionally left
   *  uncached — see client-invoices.ts). */
  recentClientInvoices: `${PREFIX}recent-client-invoices`,
  /** GET /auth/me — the logged-in user's profile shown on the Account page. */
  profile: `${PREFIX}profile`,
} as const;

/**
 * Keys for entities cached one-per-id (a department's detail, a task's
 * subtasks, a transfer row, ...). Same rules as ENTITY_CACHE_KEYS — they all
 * live under PREFIX so the version wipe and `clearAllEntityCache` cover them.
 */
export const ENTITY_ITEM_CACHE_KEYS = {
  /** One department in the list shape ({ id, name, description, menusCount, usersCount }). */
  department: (id: number) => `${PREFIX}department:${id}`,
  /** The menus assigned to one department. */
  departmentMenus: (id: number) => `${PREFIX}department-menus:${id}`,
  /** The users in one department. */
  departmentUsers: (id: number) => `${PREFIX}department-users:${id}`,
  /** GET subtasks for one task. */
  subtasks: (taskId: number) => `${PREFIX}subtasks:${taskId}`,
  /** One row of the transfers list, kept so the detail page can paint instantly. */
  transferRow: (id: number) => `${PREFIX}transfer-row:${id}`,
} as const;

export type EntityCacheKey = (typeof ENTITY_CACHE_KEYS)[keyof typeof ENTITY_CACHE_KEYS];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Wipes every entity cache entry if CACHE_VERSION has moved on since the
 * copy currently on disk was written. Cheap (one localStorage read) and
 * safe to call before every cache read — it only does real work the first
 * time it runs after a version bump.
 */
function ensureCacheVersion(): void {
  if (!isBrowser()) return;
  try {
    const stored = window.localStorage.getItem(VERSION_KEY);
    if (stored === String(CACHE_VERSION)) return;

    Object.keys(window.localStorage)
      .filter(
        (k) =>
          (k.startsWith(PREFIX) && k !== VERSION_KEY) ||
          LEGACY_KEYS.includes(k) ||
          LEGACY_KEY_PREFIXES.some((p) => k.startsWith(p)),
      )
      .forEach((k) => window.localStorage.removeItem(k));

    window.localStorage.setItem(VERSION_KEY, String(CACHE_VERSION));
  } catch {
    // Storage unavailable — nothing to reconcile, fall through as normal.
  }
}

/** Reads an entity list straight out of the local (offline) cache. `null` on a miss. */
export function readEntityCache<T>(key: string): T | null {
  if (!isBrowser()) return null;
  ensureCacheVersion();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Saves an entity list into the local (offline) cache. */
export function writeEntityCache<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  // Writes must reconcile the version too: otherwise, on a browser that has
  // no version marker yet, the first *read* after this write would see a
  // "version mismatch" and wipe the entry we just saved.
  ensureCacheVersion();
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage unavailable/full — caching is best-effort, never fatal.
  }
}

/** Drops one entity's cached entry. Call this after any create/update/delete. */
export function clearEntityCache(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

/**
 * Cache-first fetch for one entity, no bypass:
 * local db → return if present; otherwise fetch from the API, save, return.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = readEntityCache<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  writeEntityCache(key, data);
  return data;
}

/** Reads one item out of a cached list by `id`. `undefined` on a miss. */
export function readEntityCacheItem<T extends { id: number }>(
  key: string,
  id: number,
): T | undefined {
  const list = readEntityCache<T[]>(key);
  return Array.isArray(list) ? list.find((item) => item.id === id) : undefined;
}

/**
 * Shallow-merges `patch` into an already-cached entry. Does nothing on a
 * miss — there's nothing to patch, and a partial object must never be stored
 * as if it were the whole entity.
 */
export function patchEntityCache<T extends object>(key: string, patch: Partial<T>): void {
  const existing = readEntityCache<T>(key);
  if (existing !== null) writeEntityCache(key, { ...existing, ...patch });
}

/** Wipes every entry this file owns. Call on logout / when the session is cleared. */
export function clearAllEntityCache(): void {
  if (!isBrowser()) return;
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX) && k !== VERSION_KEY)
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // no-op
  }
}