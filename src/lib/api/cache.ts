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
const CACHE_VERSION = 1;
const VERSION_KEY = `${PREFIX}version`;

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
      .filter((k) => k.startsWith(PREFIX) && k !== VERSION_KEY)
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