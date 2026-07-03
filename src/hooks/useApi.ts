'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

interface UseApiOptions {
  enabled?: boolean;
  params?: Record<string, unknown>;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {},
): UseApiResult<T> {
  const { enabled = true, params } = options;

  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);
  const paramsKey = params ? JSON.stringify(params) : '';

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    api
      .get<{ data?: T } | T>(url, {
        params: params ?? undefined,
        signal: controller.signal,
      })
      .then((res) => {
        if (controller.signal.aborted) return;
        const raw = (res.data as { data?: T }).data ?? (res.data as T);
        setData(raw);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err?.message ?? 'Request failed');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey, enabled, tick]);

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  return { data, loading, error, refetch };
}