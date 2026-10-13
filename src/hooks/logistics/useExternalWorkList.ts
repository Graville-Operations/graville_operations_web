'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { externalWorkService } from '@/lib/api/external-work';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ExternalWorkApiResponse, ExternalWorkType } from '@/types/external-work';

const PAGE_SIZE = 20;
export function useExternalWorkList(workType: ExternalWorkType) {
  const [rows, setRows] = useState<ExternalWorkApiResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(async (pageIndex: number) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await externalWorkService.listByType(workType, {
        skip: pageIndex * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      if (requestId !== requestIdRef.current) return;
      setRows(res.items);
      setTotal(res.total);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setLoadError(getApiErrorMessage(err, 'Failed to load external works.'));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [workType]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(page);
  }, [fetchPage, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    rows,
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    isLoading,
    loadError,
    hasPrev: page > 0,
    hasNext: page + 1 < totalPages,
    prevPage: () => setPage((p) => Math.max(0, p - 1)),
    nextPage: () => setPage((p) => p + 1),
  };
}