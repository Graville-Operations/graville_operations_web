'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

const cache = new Map<string, unknown>();
const inFlight = new Map<string, Promise<unknown>>();

function buildKey(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const sortedEntries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return `${url}?${JSON.stringify(sortedEntries)}`;
}

export function clearCachedLookup(url: string, params?: Record<string, unknown>): void {
  cache.delete(buildKey(url, params));
}

export function clearAllCachedLookups(): void {
  cache.clear();
}

interface UseCachedLookupOptions {
  params?: Record<string, unknown>;
  enabled?: boolean;
}

interface UseCachedLookupResult<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

export function useCachedLookup<T>(
  url: string | null,
  options: UseCachedLookupOptions = {},
): UseCachedLookupResult<T> {
  const { params, enabled = true } = options;
  const key = url ? buildKey(url, params) : null;

  const [data, setData]       = useState<T | null>(() => (key && cache.has(key) ? (cache.get(key) as T) : null));
  const [loading, setLoading] = useState<boolean>(() => !!url && enabled && !(key && cache.has(key)));
  const [error, setError]     = useState(false);
  const mounted = useRef(true);

  const fetchData = useCallback((force: boolean) => {
    if (!url || !key || !enabled) return;

    if (!force && cache.has(key)) {
      setData(cache.get(key) as T);
      setLoading(false);
      setError(false);
      return;
    }

    let request = inFlight.get(key) as Promise<T> | undefined;
    if (!request || force) {
      request = api.get(url, { params }).then((res) => {
        const payload = res.data as T;
        cache.set(key, payload);
        return payload;
      });
      inFlight.set(key, request as Promise<unknown>);
    }

    setLoading(true);
    setError(false);

    request
      .then((payload) => {
        if (!mounted.current) return;
        setData(payload);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted.current) return;
        setError(true);
        setLoading(false);
      })
      .finally(() => {
        inFlight.delete(key);
      });
  }, [url, key, enabled, params]);

  useEffect(() => {
    mounted.current = true;
    fetchData(false);
    return () => { mounted.current = false; };
  }, [key, enabled]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
}