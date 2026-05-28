import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

interface CacheEntry<T> {
  data:      T;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function cacheKey(url: string, params?: Record<string, unknown>): string {
  return params ? `${url}?${JSON.stringify(params)}` : url;
}

interface UseCachedApiOptions {
  ttl?:     number;   
  enabled?: boolean;  
}

interface UseCachedApiResult<T> {
  data:       T | null;
  loading:    boolean;   
  reloading:  boolean;   
  error:      boolean;
  refetch:    () => void;
}

export function useCachedApi<T>(
  url: string,
  params?: Record<string, unknown>,
  options: UseCachedApiOptions = {},
): UseCachedApiResult<T> {
  const { ttl = 60_000, enabled = true } = options;
  const key = cacheKey(url, params);

  const cached = cache.get(key) as CacheEntry<T> | undefined;

  const [data,      setData]      = useState<T | null>(cached?.data ?? null);
  const [loading,   setLoading]   = useState<boolean>(!cached && enabled);
  const [reloading, setReloading] = useState<boolean>(false);
  const [error,     setError]     = useState<boolean>(false);
  const [tick,      setTick]      = useState(0); 

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!enabled) return;

    const now      = Date.now();
    const isFresh  = cached && (now - cached.fetchedAt) < ttl;

    if (isFresh) {
     
      setData(cached.data);
      setLoading(false);
      setError(false);
      return;
    }

    if (cached) {
      setData(cached.data);
      setLoading(false);
      setReloading(true);
    } else {
      setLoading(true);
    }
    setError(false);

    api.get(url, params ? { params } : undefined)
      .then((res) => {
        if (keyRef.current !== key) return; 
        const raw: T = res.data?.data ?? res.data;
        cache.set(key, { data: raw, fetchedAt: Date.now() });
        setData(raw);
        setError(false);
      })
      .catch(() => {
        if (keyRef.current !== key) return;
        if (!cached) setError(true);
      })
      .finally(() => {
        if (keyRef.current !== key) return;
        setLoading(false);
        setReloading(false);
      });
  }, [key, enabled, tick]);

  const refetch = () => {
    cache.delete(key); 
    setTick((n) => n + 1);
  };

  return { data, loading, error, reloading, refetch };
}

export function prefetch(url: string, params?: Record<string, unknown>): void {
  const key = cacheKey(url, params);
  if (cache.has(key)) return;
  api.get(url, params ? { params } : undefined)
    .then((res) => {
      const raw = res.data?.data ?? res.data;
      cache.set(key, { data: raw, fetchedAt: Date.now() });
    })
    .catch(() => {  });
}

export function invalidate(url: string, params?: Record<string, unknown>): void {
  cache.delete(cacheKey(url, params));
}

export function invalidatePrefix(prefix: string): void {
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) cache.delete(k);
  }
}