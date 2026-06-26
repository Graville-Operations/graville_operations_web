const CACHE_TTL = 60_000; // 1 minute

interface CacheEntry<T> {
  data: T;
  time: number;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.time > CACHE_TTL) return null; // stale
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, time: Date.now() };
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