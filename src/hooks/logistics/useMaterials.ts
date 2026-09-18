'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { materialsService } from '@/lib/api/materials';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { MaterialCatalogItem } from '@/types/store';

export function useMaterials() {
  const [materials, setMaterials] = useState<MaterialCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchAll = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const items = await materialsService.list();
      if (requestId !== requestIdRef.current) return;
      setMaterials(items);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setLoadError(getApiErrorMessage(err, 'Failed to load materials.'));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return { materials, isLoading, loadError };
}