'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  fetchSiteOperator,
  fetchUnassignedFieldOperators,
  assignFieldOperator,
  replaceFieldOperator,
  unassignFieldOperator,
} from '@/lib/api/sites';
import { FieldOperator } from '@/types/site-detail';

export function useSiteOperator(siteId: number) {
  const [operator, setOperator] = useState<FieldOperator | null>(null);
  const [loadingOperator, setLoadingOperator] = useState(true);

  const [unassignedOperators, setUnassignedOperators] = useState<FieldOperator[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  const loadOperator = useCallback(() => {
    setLoadingOperator(true);
    fetchSiteOperator(siteId)
      .then(setOperator)
      .catch(() => setOperator(null))
      .finally(() => setLoadingOperator(false));
  }, [siteId]);

  const loadUnassignedOperators = useCallback(() => {
    setLoadingUnassigned(true);
    fetchUnassignedFieldOperators()
      .then(setUnassignedOperators)
      .catch(() => setUnassignedOperators([]))
      .finally(() => setLoadingUnassigned(false));
  }, []);

  useEffect(() => { loadOperator(); }, [loadOperator]);

  const assignOperator = useCallback(async (operatorId: number) => {
    setAssigning(true);
    try {
      await assignFieldOperator(siteId, operatorId);
      loadOperator();
    } finally {
      setAssigning(false);
    }
  }, [siteId, loadOperator]);

  const replaceOperatorAction = useCallback(async (operatorId: number) => {
    setReplacing(true);
    try {
      await replaceFieldOperator(siteId, operatorId);
      loadOperator();
    } finally {
      setReplacing(false);
    }
  }, [siteId, loadOperator]);

  const unassignOperatorAction = useCallback(async () => {
    setUnassigning(true);
    try {
      await unassignFieldOperator(siteId);
      setOperator(null);
    } finally {
      setUnassigning(false);
    }
  }, [siteId]);

  return {
    operator, loadingOperator, refreshOperator: loadOperator,
    unassignedOperators, loadingUnassigned, loadUnassignedOperators,
    assigning, assignOperator,
    replacing, replaceOperatorAction,
    unassigning, unassignOperatorAction,
  };
}